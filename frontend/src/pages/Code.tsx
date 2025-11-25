import App from "@/App";
import CodeWrapper from "@/components/CodeWrapper";
import React from "react";

function Code() {
  return (
    <div>
      <main className="w-full mx-auto container m-6">
        <div className="flex flex-col gap-6">
          <CodeWrapper />
        </div>
      </main>
    </div>
  );
}

export default Code;
