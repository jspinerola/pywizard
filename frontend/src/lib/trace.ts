export type TraceEvent = {
  step: number;
  ts: number;
  dt: number;
  event: "Call" | "Line" | "Return" | string;
  func: string;
  line: number;
  fid: number;
  parent: number | null;
  depth: number;
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

export function buildCodeLines(src: string): string[] {
  return (src ?? "").replace(/\r\n/g, "\n").split("\n");
}

export function reconstructState(trace: TraceEvent[], stepIndex: number) {
  const stdoutPieces: string[] = [];
  const frames: Record<
    number,
    {
      fid: number;
      func: string;
      depth: number;
      parent: number | null;
      locals: Record<string, unknown>;
      closed: boolean;
      ret?: unknown;
    }
  > = {};
  let lastEvent: TraceEvent | null = null;

  for (let i = 0; i <= stepIndex && i < trace.length; i++) {
    const ev = trace[i];
    lastEvent = ev;
    const outDelta = (ev as any)["out+"] as string | undefined;
    if (outDelta) stdoutPieces.push(outDelta);
    if (!frames[ev.fid]) {
      frames[ev.fid] = {
        fid: ev.fid,
        func: ev.func,
        depth: ev.depth,
        parent: ev.parent ?? null,
        locals: {},
        closed: false,
      };
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
  const rootFids = new Set(
    nodes.filter((n) => n.parent == null).map((n) => n.fid)
  );
  const childrenMap = new Map<number, number[]>();
  for (const n of nodes) {
    if (n.parent != null) {
      if (!childrenMap.has(n.parent)) childrenMap.set(n.parent, []);
      childrenMap.get(n.parent)!.push(n.fid);
      rootFids.delete(n.fid);
    }
  }
  return {
    stdout,
    frames,
    lastEvent,
    childrenMap,
    rootFids: Array.from(rootFids),
  };
}

export type TraceRuntimeState = ReturnType<typeof reconstructState>;

export function fmt(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
