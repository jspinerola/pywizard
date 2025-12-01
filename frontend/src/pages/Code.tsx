import App from "@/App";
import AIOverview from "@/components/AIOverview";
import CodeWrapper from "@/components/CodeWrapper";
import React, { useState } from "react";

function Code() {
  const [showAIOverview, setShowAIOverview] = useState(false);
  const [code, setCode] = useState('print("Hello, BALLSACK!")');
  return (
    <div>
      <main className="w-full mx-auto container m-6">  
        <div className="flex flex-col gap-6 mt-4">
          {showAIOverview && (
            <AIOverview setShowAIOverview={setShowAIOverview} code={code} />
          )}
          <CodeWrapper
            setShowAIOverview={setShowAIOverview}
            setCode={setCode}
            code={code}
          />
        </div>
      </main>
    </div>
  );
}

export default Code;
