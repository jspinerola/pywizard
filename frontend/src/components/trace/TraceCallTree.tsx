import { fmt, type TraceRuntimeState } from "@/lib/trace";
import { TracePanel } from "./TracePanel";
import { cn } from "@/lib/utils";

interface TraceCallTreeProps {
  state: TraceRuntimeState;
  selectedFid: number | null;
  onSelectFid: (fid: number) => void;
}

export function TraceCallTree({
  state,
  selectedFid,
  onSelectFid,
}: TraceCallTreeProps) {
  const makeNode = (fid: number) => {
    const n = state.frames[fid];
    if (!n) return null;

    const kids = state.childrenMap.get(fid) || [];

    return (
      <div key={fid} className="ml-2">
        <button
          type="button"
          className={cn(
            "cursor-pointer select-none rounded-md px-2 py-1 inline-block border text-left text-sm",
            fid === selectedFid
              ? "bg-primary/30 border-primary"
              : " hover:border-primary/50 border-transparent"
          )}
          onClick={() => onSelectFid(fid)}
        >
          <span className="text-foreground">{n.func}</span>
          <span className="text-muted-foreground"> #{n.fid}</span>
          {n.closed && (
            <span className="ml-1 text-muted-foreground">
              (returned{typeof n.ret !== "undefined" ? `: ${fmt(n.ret)}` : ""})
            </span>
          )}
        </button>
        <div className="ml-4 border-l border-border pl-3">
          {kids.sort((a, b) => a - b).map(makeNode)}
        </div>
      </div>
    );
  };

  return (
    <TracePanel title="Call Tree">
      <div className="max-h-56 overflow-auto pr-1">
        <div>
          {state.rootFids.sort((a, b) => a - b).map((fid) => makeNode(fid))}
        </div>
      </div>
    </TracePanel>
  );
}
  