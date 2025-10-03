import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";

function CodeEditor() {
  const [code, setCode] = React.useState('print("Hello, Python!")');

  interface OnChangeParams {
    value: string;
    viewUpdate: any; // Replace `any` with a specific type if available from the library
  }

  const onChange = React.useCallback(({ value, viewUpdate }: OnChangeParams) => {
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
