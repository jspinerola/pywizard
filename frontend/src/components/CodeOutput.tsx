import React from "react";
import { Button } from "./ui/button";
import type { TracePayload } from "@/types/trace";
import { MessageCircleQuestionIcon } from "lucide-react";

function CodeOutput({
  output,
  payload,
  setShowAIOverview,
}: {
  output: string[];
  payload: TracePayload | null;
  setShowAIOverview?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <div className="flex justify-between mb-4">
        <h2 className="font-mono text-2xl font-bold text-secondary mb-4">
          Output
        </h2>
        <Button
          variant="secondary"
          disabled={!payload}
          onClick={() => setShowAIOverview && setShowAIOverview(true)}
        >
          <MessageCircleQuestionIcon size={16} /> AI Overview
        </Button>
      </div>
      <div className="rounded border h-full overflow-y-scroll">
        <pre className="p-4" id="output">
          {output.length === 0 ? "" : output.join("\n")}
        </pre>
      </div>
    </>
  );
}

export default CodeOutput;
