import App from "@/App";
import AIOverview from "@/components/AIOverview";
import CodeWrapper from "@/components/CodeWrapper";
import React from "react";

function Code() {
  const [showAIOverview, setShowAIOverview] = React.useState(true);

  return (
    <div>
<<<<<<< Updated upstream
      <main className="w-full mx-auto container m-6">
        <div className="flex flex-col gap-6">
          <CodeWrapper />
        </div>
      </main>
=======
      <div className="flex flex-col gap-6">
        {showAIOverview && <AIOverview setShowAIOverview={setShowAIOverview} />}
        <CodeWrapper setShowAIOverview={setShowAIOverview} />
      </div>
>>>>>>> Stashed changes
    </div>
  );
}

export default Code;
