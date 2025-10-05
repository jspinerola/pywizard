import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { Button } from "./ui/button";
import { loadPyodide } from "pyodide";

function CodeEditor() {
  const [code, setCode] = React.useState('print("Hello, Python!")');
  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState<string[]>([]);

  const codeWorker = useMemo(() => {
    return new Worker(new URL("../workers/codeWorker.ts", import.meta.url));
  }, []);

  const onChange = React.useCallback((value: string, viewUpdate: any) => {
    setCode(value);
  }, []);

  // Initialize Pyodide in the worker
  React.useEffect(() => {
    setLoading(true);
    codeWorker.postMessage({ type: "init" });
    console.log("Initialization message sent to worker");
  }, [codeWorker]);

  // Listen for messages from the worker
  React.useEffect(() => {
    codeWorker.onmessage = (event) => {
      console.log("Message received from worker", event.data);
      let result = event.data["message"];
      setOutput((prev) => [...prev, result]);
      setLoading(false);
    };
  }, [codeWorker]);

  async function handleRunCode() {
    console.log("Running code:", code);
    setOutput([]);
    setLoading(true);
    codeWorker.postMessage(code);
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
      <pre>{loading ? "Loading..." : output.join("\n")}</pre>
    </div>
  );
}

export default CodeEditor;
