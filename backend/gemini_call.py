import os                       # You may need to run the comments in terminal:
from google import genai        # pip install google-genai
from dotenv import load_dotenv  # pip install python-dotenv

# --- Setup ---
# Load environment variables from the .env file
load_dotenv() 

# Retrieve the API key from the environment
API_KEY = os.getenv('GEMINI_API_KEY') # I'm unsure if y'all would have access to the key let me know for testing it on your computer

if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

# --- Gemini Interaction ---
def generate_ai_response(prompt: str) -> str:
    """
    Initializes the Gemini client and generates a response based on the prompt.
    """
    try:
        # Initialize the client 
        client = genai.Client(api_key=API_KEY)
        
        # Configure the model and generate content
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Return the text content
        return response.text

    except Exception as e:
        return f"An error occurred during API call: {e}"

# --- Example Execution ---
if __name__ == "__main__":
    user_prompt = "Explain the three main steps of the Test-Driven Development (TDD) cycle in simple terms."
    print(f"Sending prompt: '{user_prompt}'\n")
    
    ai_response = generate_ai_response(user_prompt)
    
    print("--- Gemini Response ---")
    print(ai_response)

    # IT'S ALLLLIIIIIIVEEEEEEE (It works on my end -Manny)