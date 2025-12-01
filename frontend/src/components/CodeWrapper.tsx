import React from "react";
import CodeEditor from "./CodeEditor";
import CodeOutput from "./CodeOutput";
import type { TracePayload } from "../types/trace";
import TracePlayer from "./trace/TracePlayer";

function CodeWrapper({
  setShowAIOverview,
}: {
  setShowAIOverview?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [output, setOutput] = React.useState<string[]>([]);
  const [tracePayload, setTracePayload] = React.useState<TracePayload | null>(
    null
  );
  return (
    <>
      <div className="h-fit">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="h-[24rem]">
            <CodeEditor setOutput={setOutput} onTrace={setTracePayload} />
          </section>
          <section className="h-[24rem] flex flex-col">
            <CodeOutput
              output={output}
              payload={tracePayload}
              setShowAIOverview={setShowAIOverview}
            />
          </section>
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="font-mono text-2xl font-bold text-secondary mb-4">
          Visualize
        </h2>
        <TracePlayer payload={tracePayload} />
      </div>
    </>
  );
}

export default CodeWrapper;
