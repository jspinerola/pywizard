//@ts-ignore
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"); // Adjust version as needed

//@ts-ignore
let pyodideReadyPromise = globalThis.loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
});

self.onmessage = async (event) => {
  const data = event.data;

  if (data.type === "init") {
    await pyodideReadyPromise;
    self.postMessage({ type: "initialized", message: "Pyodide is ready" });
    return;
  } else if (data.type === "run") {
    console.log("Message received from main thread");
    // run code
    const result = await runCode(data);
    console.log(result);
  } else {
    console.error("Unknown message type:", data);
  }
};

async function runCode(data: { code: string; input: string }): Promise<any> {
  console.log("Running code in worker:", data);
  const { code, input } = data;
  let pyodide = await pyodideReadyPromise;

  // get stdin input from ui textarea
  let inputs = input ? input.split("\n") : [];

  // set stdin with user input
  pyodide.setStdin({
    stdin() {
      if (inputs.length === 0) return null; // EOF
      const line = inputs.shift()!;
      return line.endsWith("\n") ? line : line + "\n";
    },
    isatty: false,
    close() {},
  });

  pyodide.setStdout({
    batched: (message: string) => {
      self.postMessage({ type: "stdout", message });
    },
  });

  // run python code and catch errors
  try {
    let res = await pyodide.runPythonAsync(code);
    return res;
  } catch (error: any) {
    self.postMessage({ type: "error", message: error.toString() });
    return error.toString();
  }
}
