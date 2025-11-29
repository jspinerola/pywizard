import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from enum import Enum
from ai_routes import router as ai_router # import routes - ai_routes.py


class Fruit(BaseModel):
  name: str

class Fruits(BaseModel):
  fruits: List[Fruit]

app = FastAPI()
app.include_router(ai_router) # connecting the router

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

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

@app.get("/fruits", response_model=List[Fruit])
def get_fruits():
    return memory_db["fruits"]

@app.post("/fruits", response_model=List[Fruit])
def add_fruits(fruits: Fruits):
    memory_db["fruits"].extend(fruits.fruits)
    return memory_db["fruits"]

class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"

@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name is ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)