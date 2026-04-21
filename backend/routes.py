from fastapi import APIRouter , UploadFile , File
from ingest import ingest , search , get_answer
from pydantic import BaseModel


router = APIRouter()

class UserQue(BaseModel):
    question : str

@router.post("/user/upload/")

async def upload(file : UploadFile = File(...)):
    file_bytes = await file.read()
    file_name = file.filename
    ingest(file_bytes , file_name)

    return {"message" : "Success"}

@router.post("/user/chat/")

def chat(que : UserQue):

    chunks = search(que.question)

    model_answer = get_answer(que.question , chunks)

    return {"model_answer" : model_answer}


