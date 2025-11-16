import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { TracePanel } from "./TracePanel";
import type { TraceRuntimeState } from "@/lib/trace";
import { Check } from "lucide-react";

interface TraceLocalsProps {
  state: TraceRuntimeState;
  selectedFid: number | null;
  onSelectFid: (fid: number) => void;
}

export function TraceLocals({
  state,
  selectedFid,
  onSelectFid,
}: TraceLocalsProps) {
  const frames = Object.values(state.frames).sort(
    (a, b) => a.depth - b.depth || a.fid - b.fid
  );

  return (
    <TracePanel title="Variables and Locals">
      <div className="flex flex-wrap gap-2 mb-2">
        {frames.map((frame) => (
          <Button
            key={frame.fid}
            variant={frame.fid === selectedFid ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "rounded-xl",
              frame.closed ? "opacity-80" : "",
              frame.fid === selectedFid ? "ring-2 ring-secondary/40" : ""
            )}
            onClick={() => onSelectFid(frame.fid)}
          >
            {frame.func} <span className="opacity-70 ml-1">#{frame.fid}</span>
            {frame.closed && <span className="ml-1"><Check /></span>}
          </Button>
        ))}
      </div>
      <div className="h-40 overflow-auto rounded-xl border border-border p-2">
        {selectedFid != null && state.frames[selectedFid] ? (
          <LocalsTable localsObj={state.frames[selectedFid].locals} />
        ) : (
          <div className="text-muted-foreground text-sm">
            Select a frame above.
          </div>
        )}
      </div>
    </TracePanel>
  );
}

function LocalsTable({ localsObj }: { localsObj: Record<string, unknown> }) {
  const entries = Object.entries(localsObj);
  if (entries.length === 0)
    return <div className="text-muted-foreground text-sm">(empty)</div>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground">
          <th className="text-left font-normal">Name</th>
          <th className="text-left font-normal">Value</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} className="align-top">
            <td className="pr-3 text-secondary font-mono">{k}</td>
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
  try {
    return <span>{JSON.stringify(value)}</span>;
  } catch {
    return <span>{String(value)}</span>;
  }
}
