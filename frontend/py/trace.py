# pywiz_tracer.py  (public/py/pywiz_tracer.py)
import sys, json, io, time, inspect, linecache
USER_FILENAME = "<user_code>"

EXCLUDE_LOCAL_KEYS = {"__builtins__", "__package__", "__loader__", "__spec__", "__doc__", "__annotations__"}
def _exclude_local(k, v): return k in EXCLUDE_LOCAL_KEYS or (k.startswith("__") and k.endswith("__"))

def safe(val):
    try: return json.loads(json.dumps(val, default=str))
    except Exception: return str(val)

def trace_exec(code_text: str) -> str:
    # ---- tracer state ----
    trace, stdout_buf = [], io.StringIO()
    _last_locals_by_fid = {}; _next_fid = 1
    fid_by_frame = {}; parent_fid = {}; depth_by_frame = {}
    _step = 0; _prev_ts = None; _last_out_len = 0

    def safe_print(*args, **kwargs):
        print(*args, **kwargs, file=stdout_buf)

    SAFE_BUILTINS = {
        'abs': abs, 'min': min, 'max': max, 'range': range, 'len': len, 'print': safe_print,
        'bool': bool, 'int': int, 'float': float, 'str': str, 'list': list, 'dict': dict,
        'set': set, 'tuple': tuple, 'enumerate': enumerate, 'zip': zip, 'sum': sum,
    }

    def get_fid(frame):
        nonlocal _next_fid
        k = id(frame)
        if k not in fid_by_frame:
            fid_by_frame[k] = _next_fid; _next_fid += 1
        return fid_by_frame[k]

    def ensure_parent_depth(frame):
        k = id(frame)
        if k in depth_by_frame: return
        p = frame.f_back; pfid = None; pdepth = -1
        while p:
            if p.f_code.co_filename == USER_FILENAME:
                pfid = get_fid(p); pdepth = depth_by_frame.get(id(p), pdepth); break
            p = p.f_back
        parent_fid[k] = pfid; depth_by_frame[k] = pdepth + 1

    # Track local variable changes 
    # Prev locals: {"x": 1, "y": 2}
    # Curr locals: {"x": 2, "y": 2, "z": 9}
    # Result:
    # changed_locals = {"x": 2, "z": 9} (added/changed)
    # previous_locals = {"x": 1} (previous value for the changed key)
    def locals_patch(fid, f_locals):
        prev = _last_locals_by_fid.get(fid, {})
        filtered = {k: v for k, v in f_locals.items() if not _exclude_local(k, v)}
        curr = {k: safe(v) for k, v in filtered.items()}
        changed_locals, previous_locals = {}, {}
        for k, v in curr.items():
            if k not in prev or prev[k] != v:
                changed_locals[k] = v
                if k in prev: previous_locals[k] = prev[k]
        _last_locals_by_fid[fid] = curr
        return changed_locals, previous_locals

    def tick():
        nonlocal _step, _prev_ts
        _step += 1
        now = time.perf_counter_ns()
        dt = 0 if _prev_ts is None else now - _prev_ts
        _prev_ts = now
        return _step, now, dt

    def tracer(frame, event, arg):
        nonlocal _last_out_len
        if frame.f_code.co_filename != USER_FILENAME or event not in ("call","line","return","exception"):
            return tracer

        ensure_parent_depth(frame)
        fid = get_fid(frame)
        pf = parent_fid.get(id(frame)); 
        dep = depth_by_frame.get(id(frame), 0)
        step, ts, dt = tick()
        ev = {
            "step": step, "ts": ts, "dt": dt,
            "event": "Exception" if event=="exception" else event.capitalize(),
            "func": frame.f_code.co_name, "line": frame.f_lineno,
            "fid": fid, "parent": pf, "depth": dep,
        }

        if event == "call":
            args, varargs, varkw, values = inspect.getargvalues(frame)
            call_args = {a: safe(values[a]) for a in args if a in values}
            if varargs and varargs in values: call_args["*"+varargs] = safe(values[varargs])
            if varkw and varkw in values: call_args["**"+varkw] = safe(values[varkw])
            if call_args: ev["args"] = call_args
            changed_locals, prev_locals = locals_patch(fid, frame.f_locals)
            if changed_locals: ev["set"]=changed_locals; ev["prev"]=prev_locals

        elif event == "line":
            changed_locals, prev_locals = locals_patch(fid, frame.f_locals)
            if changed_locals: ev["set"]=changed_locals; ev["prev"]=prev_locals

        elif event == "return":
            ev["return"] = safe(arg)

        elif event == "exception":
            et, evv = arg
            ev["exc_type"] = getattr(et, "__name__", str(et))
            ev["exc"] = str(evv)

        full = stdout_buf.getvalue()
        if len(full) > _last_out_len:
            ev["out+"] = full[_last_out_len:]
            _last_out_len = len(full)

        trace.append(ev)
        if event == "return":
            # finish frame bookkeeping
            k = id(frame)
            fid_by_frame.pop(k, None); parent_fid.pop(k, None); depth_by_frame.pop(k, None)
        return tracer

    # preload source for nice line lookups later (optional)
    linecache.cache[USER_FILENAME] = (len(code_text), None, [l + "\n" for l in code_text.splitlines()], USER_FILENAME)

    env = {"__builtins__": SAFE_BUILTINS, "__name__": "__main__"}
    sys.settrace(tracer)
    try:
        compiled = compile(code_text, USER_FILENAME, "exec")
        exec(compiled, env, env)
    finally:
        sys.settrace(None)

    return json.dumps({"filename": USER_FILENAME, "code": code_text, "trace": trace})
