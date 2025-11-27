// types/trace.ts
export type TraceEvent = {
  step: number; ts: number; dt: number;
  event: "Call" | "Line" | "Return"  | "Input" | string;
  func: string; line: number; fid: number; parent: number | null; depth: number;
  args?: Record<string, unknown>;
  set?: Record<string, unknown>;
  prev?: Record<string, unknown>;
  ret?: unknown;
  [key: string]: unknown; // includes "out+"
};

export type TracePayload = {
  filename: string;
  code: string;
  trace: TraceEvent[];
};
