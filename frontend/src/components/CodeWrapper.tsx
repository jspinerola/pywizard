import React from 'react'
import CodeEditor from './CodeEditor'
import CodeOutput from './CodeOutput'

function CodeWrapper() {
  const [output, setOutput] = React.useState<string[]>([]);
  return (
    <div className='code-wrapper'>
      <CodeEditor setOutput={setOutput} />
      <CodeOutput output={output} />
    </div>
  )
}

export default CodeWrapper