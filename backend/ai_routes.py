from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai_service import AIService

# Create a router 
router = APIRouter()

# --- Data Models ---
class ChatRequest(BaseModel):
    code: str
    message: str
    history: list = []

class SummaryRequest(BaseModel):
    text: str

# --- Endpoints ---
@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    conversation = request.history + [request.message, "The code is: " + request.code]
    response = AIService.generate_chat_response(conversation)
    
    if response.startswith("Error"):
        raise HTTPException(status_code=500, detail=response)
        
    return {"reply": response}

@router.post("/summarize")
async def summarize_endpoint(request: SummaryRequest):
    summary = AIService.summarize_text(request.text)
    
    if summary.startswith("Error"):
        raise HTTPException(status_code=500, detail=summary)
        
    return {"summary": summary}