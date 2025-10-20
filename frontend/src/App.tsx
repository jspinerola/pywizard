import "./App.css";
import CodeEditor from "./components/CodeEditor";
import CodeWrapper from "./components/CodeWrapper";
import TracePlayer from "./components/TracePlayer";

function App() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Pywizard</h1>
      <CodeWrapper />
    </div>
  );
}

export default App;
