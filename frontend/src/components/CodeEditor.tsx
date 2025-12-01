import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { Button } from "./ui/button";
import type { CodeOutput } from "@/types/codeOutput";
import { Textarea } from "./ui/textarea";
import { vscodeDark, vscodeDarkInit } from "@uiw/codemirror-theme-vscode";
import { Save } from "lucide-react";

type TracePayload = { filename: string; code: string; trace: any[] };

function CodeEditor({
  setOutput,
  onTrace,
  setCode,
  code,
}: {
  setOutput: React.Dispatch<React.SetStateAction<string[]>>;
  onTrace?: (payload: TracePayload) => void;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  code: string;
}) {
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const workerRef = React.useRef<Worker | null>(null);
  const createdRef = React.useRef(false); // StrictMode guard
  const onTraceRef = React.useRef(onTrace);
  onTraceRef.current = onTrace; // keep latest without re-running effect

  const onChange = React.useCallback((value: string) => setCode(value), []);

  // Create the worker ONCE
  React.useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    const worker = new Worker(
      new URL("../workers/codeWorker.ts", import.meta.url)
    );
    workerRef.current = worker;

    setOutput(["Starting Python runtime…"]);
    setLoading(true);
    setReady(false);

    worker.onmessage = (event: MessageEvent<CodeOutput | any>) => {
      const data = event.data;

      if (data.type === "initialized") {
        setReady(true);
        setLoading(false);
        setOutput(["Ready."]);
        return;
      }

      if (data.type === "trace") {
        const payload = data.payload as TracePayload;
        // Print to the DevTools console for easier debugging
        console.log(
          "Trace payload:",
          JSON.stringify(<datalist></datalist>, null, 2)
        );
        const stdout =
          (payload.trace || []).map((e: any) => e["out+"] || "").join("") ||
          "(no output)";
        setOutput([stdout]);
        onTraceRef.current?.(payload);
        setLoading(false);
        return;
      }

      if (data.type === "error") {
        setOutput(data.payload.error);
        setLoading(false);
        return;
      }

      console.warn("Unknown message from worker:", data);
    };

    worker.postMessage({ type: "init" });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
    // DO NOT add deps here — we want this to run exactly once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunCode = React.useCallback(() => {
    if (!workerRef.current) {
      setOutput(["Worker not created."]);
      return;
    }
    if (!ready) {
      setOutput(["Initializing Python… please wait, then try again."]);
      return;
    }
    setOutput([]);
    setLoading(true);
    workerRef.current.postMessage({ type: "run", code, input });
  }, [code, input, ready, setOutput]);

  // QoL: Ctrl/Cmd+Enter to run
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "enter" &&
        !loading
      ) {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRunCode, loading]);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex justify-between mb-4">
        <h2 className="font-mono text-2xl font-bold text-secondary">Code</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleRunCode}
            disabled={loading || !ready || !workerRef.current}
            title={ready ? "Run (Ctrl/Cmd + Enter)" : "Initializing Python…"}
          >
            {ready ? (loading ? "Running…" : "Run Code") : "Initializing…"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOutput([])}
            disabled={loading}
          >
            Clear Output
          </Button>
          <Button variant="outline" size="icon">
            <Save />
          </Button>
        </div>
      </div>
      <div className="flex flex-col justify-between h-full">
        <CodeMirror
          value={code}
          height="240px"
          extensions={[python()]}
          theme={vscodeDark}
          onChange={onChange}
        />

        <div className="space-y-1">
          <label htmlFor="input" className="font-mono font-bold text-secondary">
            Input (stdin):
          </label>
          <Textarea
            id="input"
            placeholder="Enter input here, one line per input()"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
