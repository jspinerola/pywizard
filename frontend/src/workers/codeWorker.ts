importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"); // Adjust version as needed

let pyodideReadyPromise = globalThis.loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
});

self.onmessage = async (event) => {
  if (event.data.type === "init") {
    await pyodideReadyPromise;
    self.postMessage({ type: "initialized", message: "Pyodide is ready" });
    return;
  }
  console.log("Message received from main thread");
  const data = event.data;
  // run code
  const result = await runCode(data);
  console.log(result);
  self.postMessage(result); // Send result back to the main thread
};

async function runCode(input: string): Promise<any> {
  console.log("Running code in worker:", input);
  let pyodide = await pyodideReadyPromise;

  pyodide.setStdout({
    batched: (message) => {
      self.postMessage({ type: "stdout", message });
    },
  });

  try {
    let res = await pyodide.runPythonAsync(input);
    return res;
  } catch (error) {
    self.postMessage({ type: "error", message: error.toString() });
    return error.toString();
  }
}
