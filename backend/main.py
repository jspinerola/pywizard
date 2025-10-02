import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

class Fruit(BaseModel):
  name: str

class Fruits(BaseModel):
  fruits: List[Fruit]

app = FastAPI()

# allowed origins, frontend url
origins = [
  "http://localhost:5173",
]

# for handling CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

memory_db = {"fruits": []}

@app.get("/fruits", response_model=List[Fruit])
def get_fruits():
    return memory_db["fruits"]

@app.post("/fruits", response_model=List[Fruit])
def add_fruits(fruits: Fruits):
    memory_db["fruits"].extend(fruits.fruits)
    return memory_db["fruits"]

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)