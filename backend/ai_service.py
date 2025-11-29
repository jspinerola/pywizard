import os
import google.generativeai as genai
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

# 2. Configure the API key
# Make sure you have a .env file with GEMINI_API_KEY=your_key_here
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("No API key found. Please check your .env file.")

genai.configure(api_key=api_key)

# 3. Initialize the Model
model = genai.GenerativeModel('gemini-2.5-flash') 

class AIService:
    
    @staticmethod
    def generate_chat_response(conversation_history):
        """
        Handles chatbot logic. 
        conversation_history should be a list of messages.
        """
        try:
            # Start a chat session
            chat = model.start_chat(history=conversation_history)
            
            # You would pass the last user message here. 
            # For simplicity in this function, we assume the history is managed.
            # Usually, you send the new message to the chat object.
            # This is a generic example of sending a prompt:
            response = chat.send_message("Please continue the conversation.")
            return response.text
        except Exception as e:
            return f"Error in chat generation: {str(e)}"

    @staticmethod
    def summarize_text(text_to_summarize):
        """
        Handles text summarization.
        """
        try:
            prompt = f"Please summarize the following text concisely:\n\n{text_to_summarize}"
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error in summarization: {str(e)}"

# Simple test block to run this file directly
if __name__ == "__main__":
    service = AIService()
    print("--- Testing Summarization ---")
    print(service.summarize_text("Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation."))