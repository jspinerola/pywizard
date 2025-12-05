import React, { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function AIOverview({
  setShowAIOverview,
  code,
}: {
  code: string;
  setShowAIOverview: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const TRANSITION_MS = 300;

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

     try {
      // Dummy axios call for future LLM integration
      // This simulates an API call with a delay
      // TODO: Replace with actual LLM API endpoint when ready
      const response = await axios.post(
        "/api/chat", // Placeholder endpoint - will be replaced with actual LLM endpoint
        {
          code: code,
          message: userMessage.content,
          conversation_history: messages,
        }
      );

      // For now, return a dummy response
      // In the future, this will be: response.data.message
      const assistantMessage: Message = {
        role: "assistant",
        content:
          response.data?.reply ||
          `I received your message: "${userMessage.content}". This is a placeholder response. The LLM integration will be implemented here.`,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Handle error - in a real implementation, this would handle API errors
      // For now, we'll simulate a response even on error since it's a dummy endpoint
      // When the real endpoint is implemented, this will show actual error messages
      const assistantMessage: Message = {
        role: "assistant",
        content: `I understand you said: "${userMessage.content}". This is a dummy response. When the LLM integration is complete, real responses will appear here.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }
  return (
    <>
      <aside
        className={
          "fixed right-0 top-0 h-screen bg-background border-l p-4 z-20 transform transition-transform duration-300 ease-in-out flex flex-col " +
          "w-full sm:w-1/2 " + // full width on mobile, half on sm+
          (visible ? "translate-x-0" : "translate-x-full")
        }
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="AI Overview"
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="font-mono text-2xl font-bold text-secondary">
              AI Overview
            </h2>
            <Button onClick={closeWithAnimation} variant="ghost" size="icon">
              <X />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto pr-2 mb-4">
            <div className="flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center py-12">
                  Start a conversation by asking a question about your code.
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-secondary-foreground"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-secondary-foreground rounded-lg px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="flex gap-2 shrink-0 pt-4 border-t">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your code..."
              className="resize-none min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-[60px] w-[60px] shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
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
