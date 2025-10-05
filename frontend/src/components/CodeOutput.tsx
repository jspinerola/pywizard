import React from "react";

function CodeOutput({ output }: { output: string[] }) {
  return (
    <div className="m-4 rounded border">
      <h2 className="bg-accent p-2">Output</h2>
      <pre className="p-4" id="output">
        {output.length === 0 ? "" : output.join("\n")}
      </pre>
    </div>
  );
}

export default CodeOutput;
