import React from 'react'
import CodeEditor from './CodeEditor'
import CodeOutput from './CodeOutput'

function CodeWrapper() {
  return (
    <div className='code-wrapper'>
      <CodeEditor />
      <CodeOutput />
    </div>
  )
}

export default CodeWrapper