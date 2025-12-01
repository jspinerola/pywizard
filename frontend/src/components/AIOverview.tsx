import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";

function AIOverview({
  setShowAIOverview,
}: {
  setShowAIOverview: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [visible, setVisible] = useState(false);
  const TRANSITION_MS = 300;

  const sampleText = `
This code is a **single-line Python program** designed to perform the most fundamental operation: outputting text.



The entire program consists of the command \`print("Hello, Python!")\`.

1.  When the code runs, the Python interpreter starts executing the main module.
2.  It encounters the **\`print()\` function**.
3.  The \`print()\` function takes the string **\`"Hello, Python!"\`** as its input, or **argument**.
4.  The function then displays this exact string of characters to the **standard output** (usually the console or screen).
5.  After displaying the text, the \`print()\` function automatically adds a **newline character** (\`\n\`), moving the cursor to the next line.
6.  Once this single line is executed, the program terminates.

In essence, the code simply **prints a greeting** to the user and finishes.`;

  useEffect(() => {
    // trigger enter animation on mount
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  function closeWithAnimation() {
    setVisible(false);
    // wait for animation to finish before unmounting
    setTimeout(() => setShowAIOverview(false), TRANSITION_MS);
  }
  return (
    <>
      <aside
        className={
          "fixed right-0 top-0 h-screen bg-background border-l p-4 z-20 transform transition-transform duration-300 ease-in-out " +
          "w-full sm:w-1/2 " + // full width on mobile, half on sm+
          (visible ? "translate-x-0" : "translate-x-full")
        }
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="AI Overview"
      >
        <div className="flex justify-between">
          <h2 className="font-mono text-2xl font-bold text-secondary mb-4">
            AI Overview
          </h2>
          <Button onClick={closeWithAnimation}>
            <X />
          </Button>
        </div>
        <div className="overflow-y-auto h-[90vh]">
          <h3 className="font-mono text-xl font-bold text-secondary mb-4">
            Summary
          </h3>
          <div className="max-w-none dark:prose-invert text-base list-decimal list-inside">
            TODO 
            <ReactMarkdown>{sampleText}</ReactMarkdown>
          </div>

          <h3 className="font-mono text-xl font-bold text-secondary mb-4">
            Ask
          </h3>
        </div>
      </aside>
      <div
        className={
          "fixed left-0 top-0 w-screen h-screen bg-black z-10 transition-all duration-300 ease-out " +
          (visible ? "opacity-50" : "opacity-0 pointer-events-none")
        }
        onClick={closeWithAnimation}
      ></div>
    </>
  );
}

export default AIOverview;
