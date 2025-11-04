import React from "react";

function CodeOutput({ output }: { output: string[] }) {
  return (
    <>
      <h2 className="font-mono text-2xl font-bold text-secondary mb-4">Output</h2>
      <div className="rounded border">
        <pre className="p-4" id="output">
          {output.length === 0 ? "" : output.join("\n")}
        </pre>
      </div>
    </>
  );
}

export default CodeOutput;
