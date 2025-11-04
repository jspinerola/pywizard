import React from "react";
import CodeEditor from "./CodeEditor";
import CodeOutput from "./CodeOutput";
import TracePlayer from "./TracePlayer";
import type { TracePayload } from "../types/trace";

function CodeWrapper() {
  const [output, setOutput] = React.useState<string[]>([]);
  const [tracePayload, setTracePayload] = React.useState<TracePayload | null>(
    null
  );
  return (
    <div className="code-wrapper">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="">
          <CodeEditor setOutput={setOutput} onTrace={setTracePayload} />
        </section>
        <section className="">
          <CodeOutput output={output} />
          <TracePlayer payload={tracePayload} />
        </section>
      </div>
    </div>
  );
}

export default CodeWrapper;
