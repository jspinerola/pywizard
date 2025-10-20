import React from 'react'
import CodeEditor from './CodeEditor'
import CodeOutput from './CodeOutput'
import TracePlayer from './TracePlayer'
import type { TracePayload } from "../types/trace";

function CodeWrapper() {
  const [output, setOutput] = React.useState<string[]>([]);
  const [tracePayload, setTracePayload] = React.useState<TracePayload | null>(null);
  return (
    <div className='code-wrapper'>
      <CodeEditor setOutput={setOutput} onTrace={setTracePayload}/>
      <CodeOutput output={output} />
      <TracePlayer payload={tracePayload} />
    </div>
  )
}

export default CodeWrapper