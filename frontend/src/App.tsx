import "./App.css";
import CodeEditor from "./components/CodeEditor";
import CodeWrapper from "./components/CodeWrapper";
import TracePlayer from "./components/TracePlayer";
import logo from "./assets/pywizard.png";

function App() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <img
          src={logo}
          alt="Pywizard logo"
          className="w-20 h-20 object-contain"
        />
        <h1 className="text-3xl font-bold">Pywizard</h1>
      </div>
      <CodeWrapper />
    </div>
  );
}

export default App;
