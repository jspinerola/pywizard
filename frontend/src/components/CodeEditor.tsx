import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { Button } from "./ui/button";
import { loadPyodide } from "pyodide";
import type { CodeOutput } from "@/types/CodeOutput";

function CodeEditor({
  setOutput,
}: {
  setOutput: React.Dispatch<React.SetStateAction<string[]>>;
}) {

  // State to hold the code input and loading status
  const [code, setCode] = React.useState('print("Hello, Python!")');
  const [loading, setLoading] = React.useState(false);

  // Memoized callback to handle code changes
  const onChange = React.useCallback((value: string, viewUpdate: any) => {
    setCode(value);
  }, []);

  // Ref to hold the worker instance
  const workerRef = React.useRef<Worker | null>(null);

  // Effect to initialize the web worker
  React.useEffect(() => {
    const worker = new Worker(
      new URL("../workers/codeWorker.ts", import.meta.url)
    );
    workerRef.current = worker;

    // Handle messages from the worker
    worker.onmessage = (event: MessageEvent<CodeOutput>) => {
      console.log("Message received from worker", event.data);

      if (event.data.type === "initialized") {
        setLoading(false);
      } else if (event.data.type === "stdout" || event.data.type === "error") {
        let result = event.data.message;
        setOutput((prev) => [...prev, result]);
        setLoading(false);
      } else {
        console.warn("Unknown message type from worker:", event.data);
      }
    };

    // Initialize Pyodide in the worker
    setLoading(true);
    worker.postMessage({ type: "init" });
    console.log("Initialization message sent to worker");

    // Cleanup function to terminate the worker on unmount
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [setOutput]);

  // Function to handle code execution
  async function handleRunCode() {
    console.log("Running code:", code);
    setOutput([]);
    setLoading(true);
    workerRef.current?.postMessage(code);
    console.log("Message posted to worker");
  }

  return (
    <div>
      <CodeMirror
        value={code}
        height="200px"
        extensions={[python()]}
        onChange={onChange}
      />
      {loading ? (
        <Button disabled>Loading...</Button>
      ) : (
        <Button
          className="bg-background text-foreground"
          onClick={handleRunCode}
        >
          Run Code
        </Button>
      )}
    </div>
  );
}

export default CodeEditor;
