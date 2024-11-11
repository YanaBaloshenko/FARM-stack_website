from enum import Enum
from fastapi import FastAPI, Body, Request, Header, Form, File, UploadFile, status, HTTPException, Depends
from pydantic import BaseModel
from typing import Annotated
import shutil

from routers.users import router as users_router

##################################### definitions #####################################

app = FastAPI()

app.include_router(users_router, prefix="/users", tags=["users"])

# basic user model
class UserModel(BaseModel):
    username: str
    name: str

# class for defining account type - admin or user
class AccType(str, Enum):
    ADMIN = "admin"
    USER = "user"

# dependency
async def pagination(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

##################################### methods #####################################

# default get request
@app.get("/")
async def root():
    return {"message": "This is a default page"}

# setting a status code
@app.get("/status", status_code=status.HTTP_208_ALREADY_REPORTED)
async def raw_fa_response():
    return {"message": "fastapi response"}

# reading user agent by using the Header - extracting headers
@app.get("/headers")
async def read_headers(user_agent: Annotated[str | None, Header()] = None):
    return {"user_agent": user_agent}

# gives users who have certain parameters within a given limit
@app.get("/user/money")
async def user_by_money(min_m: int = 0, max_m: int = 100000):
    return {"message": f"Listing users with money between {min_m} and {max_m}"}

# gets the user profile based on id
@app.get("/{acc_type}/{id}")
async def user(id: int, acc_type: AccType):
    return {"user_id": id, "acc_type": acc_type}

# get users depending on pagination
@app.get("/users")
async def read_users(commons: Annotated[dict, Depends(pagination)]):
    return commons

# adds new user with restriction to username
@app.post("/users")
async def new_user(data: UserModel):
    if data.username == "admin":
        raise HTTPException(
            status.HTTP_406_NOT_ACCEPTABLE, detail="Can't create user with this name"
        )
    return {"message": data}

# uploading files
@app.post("/upload")
async def upload(
    picture: UploadFile = File(...),
    brand: str = Form(...),
    model: str = Form(...)):
    with open("saved_file.png", "wb") as buffer:
        shutil.copyfileobj(picture.file, buffer)
    return {"brand": brand, "model": model, "file_name": picture.filename}
# async def upload(
#     file: UploadFile = File(...), brand: str = Form(...), model: str = Form(...)):
#     return {"brand": brand, "model": model, "file_name": file.filename}
