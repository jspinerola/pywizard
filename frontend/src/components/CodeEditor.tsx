import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";

function CodeEditor() {
  const [code, setCode] = React.useState('print("Hello, Python!")');

  const onChange = React.useCallback((value: string, viewUpdate: any) => {
    setCode(value);
  }, []);

  return (
    <CodeMirror
      value={code}
      height="200px"
      extensions={[python()]}
      onChange={onChange}
    />
  );
}

export default CodeEditor;
