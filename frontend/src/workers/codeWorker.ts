// codeWorker.ts (Web Worker)

// Use classic worker style with importScripts
// @ts-ignore
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

let isReady = false;
let isRunning = false;

// @ts-ignore
const pyodideReadyPromise = (globalThis as any).loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
});

self.onmessage = async (event: MessageEvent<any>) => {
  const data = event.data;

  // Always get the pyodide instance first
  const pyodide = await pyodideReadyPromise;

  if (data.type === "init") {
    try {
      await loadTracer(pyodide);         // load module file into FS + import
      isReady = true;
      self.postMessage({ type: "initialized", message: "Pyodide ready + tracer loaded" });
    } catch (e: any) {
      self.postMessage({ type: "error", message: `Init failed: ${String(e)}` });
    }
    return;
  }

  if (data.type === "run") {
    if (!isReady) {
      self.postMessage({ type: "error", message: "Worker not initialized yet. Call init first." });
      return;
    }
    if (isRunning) {
      self.postMessage({ type: "error", message: "A run is already in progress. Please wait." });
      return;
    }

    isRunning = true;
    const { code, input } = data;

    // Setup stdin from UI textarea
    const inputs = input ? String(input).split("\n") : [];
    pyodide.setStdin({
      stdin() {
        if (!inputs.length) return null;            // EOF -> input() will raise EOFError in user code
        const line = inputs.shift()!;
        return line.endsWith("\n") ? line : line + "\n";
      },
      isatty: false,
      close() {},
    });

    // Disable direct stdout piping; tracer emits "out+" deltas in the JSON.
    pyodide.setStdout({ batched: () => {} });

    try {
      const jsonStr = await pyodide.runPythonAsync(`
        from pywiz_tracer import trace_exec
        trace_exec(${JSON.stringify(code)})
      `);
      const payload = JSON.parse(jsonStr);
      self.postMessage({ type: "trace", payload }); // { filename, code, trace: [...] }
    } catch (err: any) {
      self.postMessage({ type: "error", message: String(err) });
    } finally {
      isRunning = false;
    }
    return;
  }

  self.postMessage({ type: "error", message: `Unknown message type: ${String(data?.type)}` });
};

// Load your tracer module into Pyodide's FS and make it importable
async function loadTracer(pyodide: any) {
  // Serve this file from your app (e.g., /py/trace.py).
  // If you use a different path, update the fetch URL below.
  const src = await (await fetch("/py/trace.py")).text();

  // Place it as a package so 'import pywiz_tracer' works
  pyodide.FS.mkdirTree("/pkg/pywiz_tracer");
  pyodide.FS.writeFile("/pkg/pywiz_tracer/__init__.py", src);

  // Add /pkg to sys.path and import once
  await pyodide.runPythonAsync(`import sys; sys.path.insert(0, "/pkg")`);
  await pyodide.runPythonAsync(`import pywiz_tracer`);
}
