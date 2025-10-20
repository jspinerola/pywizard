import React, { useEffect, useMemo, useRef, useState } from "react";

type TraceEvent = {
  step: number; ts: number; dt: number;
  event: "Call" | "Line" | "Return" | string;
  func: string; line: number; fid: number; parent: number | null; depth: number;
  args?: Record<string, unknown>;
  set?: Record<string, unknown>;
  prev?: Record<string, unknown>;
  ret?: unknown;
  [key: string]: unknown; // out+
};

export interface TracePayload {
  filename: string;
  code: string;
  trace: TraceEvent[];
}

function buildCodeLines(src: string): string[] {
  return (src ?? "").replace(/\r\n/g, "\n").split("\n");
}

function reconstructState(trace: TraceEvent[], stepIndex: number) {
  const stdoutPieces: string[] = [];
  const frames: Record<number, { fid: number; func: string; depth: number; parent: number | null; locals: Record<string, unknown>; closed: boolean; ret?: unknown }>
    = {};
  let lastEvent: TraceEvent | null = null;

  for (let i = 0; i <= stepIndex && i < trace.length; i++) {
    const ev = trace[i];
    lastEvent = ev;
    const outDelta = (ev as any)["out+"] as string | undefined;
    if (outDelta) stdoutPieces.push(outDelta);
    if (!frames[ev.fid]) {
      frames[ev.fid] = { fid: ev.fid, func: ev.func, depth: ev.depth, parent: ev.parent ?? null, locals: {}, closed: false };
      if (ev.args) Object.assign(frames[ev.fid].locals, ev.args);
    }
    if (ev.set) Object.assign(frames[ev.fid].locals, ev.set);
    if (ev.event === "Return") {
      frames[ev.fid].closed = true;
      if (typeof ev.ret !== "undefined") frames[ev.fid].ret = ev.ret;
    }
  }

  const stdout = stdoutPieces.join("");
  const nodes = Object.values(frames);
  const rootFids = new Set(nodes.filter(n => n.parent == null).map(n => n.fid));
  const childrenMap = new Map<number, number[]>();
  for (const n of nodes) {
    if (n.parent != null) {
      if (!childrenMap.has(n.parent)) childrenMap.set(n.parent, []);
      childrenMap.get(n.parent)!.push(n.fid);
      rootFids.delete(n.fid);
    }
  }
  return { stdout, frames, lastEvent, childrenMap, rootFids: Array.from(rootFids) };
}

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function TracePlayer({ payload }: { payload: TracePayload | null }) {
  const trace = payload?.trace ?? [];
  const filename = payload?.filename ?? "<user_code>";
  const code = payload?.code ?? "";

  const lines = useMemo(() => buildCodeLines(code), [code]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const codePaneRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedFid, setSelectedFid] = useState<number | null>(null);

  const maxStep = Math.max(0, trace.length - 1);
  const state = useMemo(() => reconstructState(trace, stepIndex), [trace, stepIndex]);
  const current = state.lastEvent;

  // reset when new payload arrives
  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
    setSelectedFid(null);
    lastTsRef.current = null;
    if (codePaneRef.current) codePaneRef.current.scrollTop = 0;
  }, [payload]);

  useEffect(() => {
    if (state.lastEvent) setSelectedFid(state.lastEvent.fid);
  }, [stepIndex, state.lastEvent]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }
    const loop = (nowMs: number) => {
      if (stepIndex >= maxStep) {
        setPlaying(false);
        return;
      }
      const nextEv = trace[stepIndex + 1];
      const waitMs = (nextEv?.dt ?? 0) / 1_000_000 / Math.max(0.001, speed);
      if (lastTsRef.current == null) lastTsRef.current = nowMs;
      const elapsed = nowMs - lastTsRef.current;
      if (elapsed >= waitMs) {
        setStepIndex(s => Math.min(maxStep, s + 1));
        lastTsRef.current = nowMs;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, stepIndex, maxStep, speed, trace]);

  useEffect(() => {
    if (!autoScroll || !state.lastEvent) return;
    const lineNum = state.lastEvent.line;
    const el = document.getElementById(`code-line-${lineNum}`);
    if (el && codePaneRef.current) {
      const parent = codePaneRef.current;
      const elTop = el.offsetTop;
      if (elTop < parent.scrollTop || elTop > parent.scrollTop + parent.clientHeight - 60) {
        parent.scrollTo({ top: Math.max(0, elTop - parent.clientHeight / 3), behavior: "smooth" });
      }
    }
  }, [state.lastEvent, autoScroll]);

if (!payload) {
  return (
    <div className="min-h-[300px] w-full bg-white text-neutral-800 p-6 rounded-xl border border-neutral-200">
      Run code to see a trace. When the worker posts <code>{'{ type: "trace", payload }'}</code>, pass that payload into <code>{`<TracePlayer payload={payload} />`}</code>.
    </div>
  );
}

return (
  <div className="min-h-screen w-full bg-white text-neutral-900 p-4">
    <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-3">
        <Panel title="Transport">
          <div className="flex items-center gap-2 flex-wrap">
            <button className={btn()} onClick={() => setStepIndex(0)}>⏮️ Reset</button>
            <button className={btn()} onClick={() => setStepIndex(s => Math.max(0, s - 1))}>◀️ Prev</button>
            <button className={btn(true)} onClick={() => setPlaying(p => !p)}>{playing ? "⏸ Pause" : "▶ Play"}</button>
            <button className={btn()} onClick={() => setStepIndex(s => Math.min(maxStep, s + 1))}>Next ▶️</button>
            <button className={btn()} onClick={() => setStepIndex(maxStep)}>⏭️ End</button>
          </div>
          <div className="mt-3">
            <input type="range" min={0} max={maxStep} value={stepIndex} onChange={(e) => setStepIndex(parseInt(e.target.value, 10))} className="w-full" />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Step {stepIndex}/{maxStep}</span>
              <span>Speed: {speed.toFixed(2)}×</span>
            </div>
            <input type="range" min={0.25} max={4} step={0.25} value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full mt-1" />
            <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} />
              Auto-scroll code
            </label>
          </div>
        </Panel>
      </div>

      {/* Code */}
      <div className="lg:col-span-1">
        <Panel title={`Code: ${filename || "<user_code>"}`}>
          <div ref={codePaneRef} className="h-[540px] overflow-auto rounded-xl bg-neutral-50 border border-neutral-200">
            <pre className="m-0 p-3 font-mono text-sm leading-6">
              {lines.map((text, idx) => {
                const ln = idx + 1;
                const isCurr = current?.line === ln;
                return (
                  <div
                    id={`code-line-${ln}`}
                    key={ln}
                    className={classNames(
                      "grid grid-cols-[56px_1fr] gap-3 px-2 rounded-lg",
                      isCurr ? "bg-emerald-100 border border-emerald-300" : "hover:bg-neutral-100"
                    )}
                  >
                    <span className="text-right text-neutral-500 select-none">{ln.toString().padStart(3, " ")}</span>
                    <code className="whitespace-pre-wrap">{text || "\u00A0"}</code>
                  </div>
                );
              })}
            </pre>
          </div>
          {current && (
            <div className="mt-2 text-xs text-neutral-600">
              <span className="mr-3">Event: <b className="text-neutral-900">{current.event}</b></span>
              <span className="mr-3">Func: <b className="text-neutral-900">{current.func}</b></span>
              <span className="mr-3">Line: <b className="text-neutral-900">{current.line}</b></span>
              <span className="mr-3">FID: <b className="text-neutral-900">{current.fid}</b></span>
            </div>
          )}
        </Panel>
      </div>

      {/* Side */}
      <div className="lg:col-span-1 space-y-3">
        <Panel title="Call Tree">
          <div className="max-h-56 overflow-auto pr-1">
            {renderTree(state, selectedFid, setSelectedFid)}
          </div>
        </Panel>

        <Panel title="Locals (by frame)">
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.values(state.frames).sort((a,b)=>a.depth-b.depth || a.fid-b.fid).map(fr => (
              <button key={fr.fid} className={tag(fr.fid === selectedFid, fr.closed)} onClick={()=>setSelectedFid(fr.fid)}>
                {fr.func} <span className="opacity-70">#{fr.fid}</span>
                {fr.closed && <span className="ml-1">✔</span>}
              </button>
            ))}
          </div>
          <div className="h-40 overflow-auto bg-neutral-50 rounded-xl border border-neutral-200 p-2">
            {selectedFid != null && state.frames[selectedFid] ? (
              <LocalsTable localsObj={state.frames[selectedFid].locals} />
            ) : (
              <div className="text-neutral-500 text-sm">Select a frame above.</div>
            )}
          </div>
        </Panel>

        <Panel title="Stdout">
          <div className="h-28 overflow-auto bg-neutral-50 rounded-xl border border-neutral-200 p-2 font-mono text-sm whitespace-pre-wrap">
            {state.stdout || <span className="text-neutral-400">(no output)</span>}
          </div>
        </Panel>
      </div>
    </div>
  </div>
);
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
      <header className="px-4 py-2 border-b border-neutral-200 text-sm text-neutral-600">
        {title}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function LocalsTable({ localsObj }: { localsObj: Record<string, unknown> }) {
  const entries = Object.entries(localsObj);
  if (entries.length === 0) return <div className="text-neutral-500 text-sm">(empty)</div>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-neutral-500">
          <th className="text-left font-normal">Name</th>
          <th className="text-left font-normal">Value</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} className="align-top">
            <td className="pr-3 text-emerald-700 font-mono">{k}</td>
            <td className="font-mono break-words">
              <JsonInline value={v} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function JsonInline({ value }: { value: unknown }) {
  try { return <span>{JSON.stringify(value)}</span>; }
  catch { return <span>{String(value)}</span>; }
}

function renderTree(
  state: ReturnType<typeof reconstructState>,
  selectedFid: number | null,
  setSelectedFid: (fid: number) => void
) {
  const makeNode = (fid: number) => {
    const n = state.frames[fid];
    if (!n) return null;
    const kids = state.childrenMap.get(fid) ?? [];
    return (
      <div key={fid} className="ml-2">
        <div
          className={classNames(
            "cursor-pointer select-none rounded-md px-2 py-1 inline-block border",
            fid === selectedFid
              ? "bg-emerald-100 border-emerald-300"
              : "bg-white hover:bg-neutral-100 border-transparent"
          )}
          onClick={() => setSelectedFid(fid)}
        >
          <span className="text-emerald-700">{n.func}</span>
          <span className="text-neutral-500"> #{n.fid}</span>
          {n.closed && (
            <span className="ml-1 text-neutral-500">
              (returned{typeof n.ret !== "undefined" ? `: ${fmt(n.ret)}` : ""})
            </span>
          )}
        </div>
        <div className="ml-4 border-l border-neutral-300 pl-3">
          {kids.sort((a, b) => a - b).map(makeNode)}
        </div>
      </div>
    );
  };
  return <div>{state.rootFids.sort((a, b) => a - b).map(makeNode)}</div>;
}

function fmt(v: unknown) { try { return JSON.stringify(v); } catch { return String(v); } }

function btn(primary = false) {
  return classNames(
    "px-3 py-1.5 rounded-xl text-sm border transition-colors",
    primary
      ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"
      : "bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800"
  );
}

function tag(active = false, closed = false) {
  return classNames(
    "px-3 py-1 rounded-xl text-sm border transition-colors",
    closed
      ? "border-neutral-300 text-neutral-500 bg-white"
      : "border-emerald-300 text-emerald-700 bg-emerald-50",
    active ? "ring-2 ring-emerald-300" : "hover:bg-neutral-100"
  );
}
