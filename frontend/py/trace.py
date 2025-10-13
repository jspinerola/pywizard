# pywiz_tracer.py  (public/py/pywiz_tracer.py)
import sys, json, io, time, inspect, linecache
USER_FILENAME = "<user_code>"

EXCLUDE_LOCAL_KEYS = {"__builtins__", "__package__", "__loader__", "__spec__", "__doc__", "__annotations__"}
def _exclude_local(k, v): return k in EXCLUDE_LOCAL_KEYS or (k.startswith("__") and k.endswith("__"))

def safe(val):
    try: return json.loads(json.dumps(val, default=str))
    except Exception: return str(val)

def trace_exec(code_text: str) -> str:
    # ---- tracer state (compact animatable) ----
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

    def _get_fid(frame):
        nonlocal _next_fid
        k = id(frame)
        if k not in fid_by_frame:
            fid_by_frame[k] = _next_fid; _next_fid += 1
        return fid_by_frame[k]

    def _ensure_parent_depth(frame):
        k = id(frame)
        if k in depth_by_frame: return
        p = frame.f_back; pfid = None; pdepth = -1
        while p:
            if p.f_code.co_filename == USER_FILENAME:
                pfid = _get_fid(p); pdepth = depth_by_frame.get(id(p), pdepth); break
            p = p.f_back
        parent_fid[k] = pfid; depth_by_frame[k] = pdepth + 1

    def _locals_patch(fid, f_locals):
        prev = _last_locals_by_fid.get(fid, {})
        filtered = {k: v for k, v in f_locals.items() if not _exclude_local(k, v)}
        curr = {k: safe(v) for k, v in filtered.items()}
        setp, prevp = {}, {}
        for k, v in curr.items():
            if k not in prev or prev[k] != v:
                setp[k] = v
                if k in prev: prevp[k] = prev[k]
        _last_locals_by_fid[fid] = curr
        return setp, prevp

    def _tick():
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

        _ensure_parent_depth(frame)
        fid = _get_fid(frame)
        pf = parent_fid.get(id(frame)); dep = depth_by_frame.get(id(frame), 0)
        step, ts, dt = _tick()
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
            setp, prevp = _locals_patch(fid, frame.f_locals)
            if setp: ev["set"]=setp; ev["prev"]=prevp

        elif event == "line":
            setp, prevp = _locals_patch(fid, frame.f_locals)
            if setp: ev["set"]=setp; ev["prev"]=prevp

        elif event == "return":
            ev["ret"] = safe(arg)

        elif event == "exception":
            et, evv, tb = arg
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
