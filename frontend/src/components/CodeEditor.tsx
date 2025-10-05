import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { Button } from "./ui/button";
import { loadPyodide } from "pyodide";

function CodeEditor() {
  const [code, setCode] = React.useState('print("Hello, Python!")');
  const [output, setOutput] = React.useState("");

  const onChange = React.useCallback((value: string, viewUpdate: any) => {
    setCode(value);
  }, []);

  async function handleRunCode() {
    let pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/",
    });
    let res = await pyodide.runPythonAsync(code);
    setOutput(res);
  }

  return (
    <div>
      <CodeMirror
        value={code}
        height="200px"
        extensions={[python()]}
        onChange={onChange}
      />
      <Button className="bg-background text-foreground" onClick={handleRunCode}>
        Run Code
      </Button>
      <pre>{output}</pre>
    </div>
  );
}

export default CodeEditor;
