import shutil
import os
from dotenv import load_dotenv
from enum import Enum
from collections import defaultdict

from pydantic import BaseModel
from typing import Annotated

from fastapi import FastAPI, Body, Request, Header, Form, File, UploadFile, status, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

import asyncio
from motor import motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient

from contextlib import asynccontextmanager

# from pymongo.server_api import ServerApi

#from config import BaseConfig

from backend.routers.users import router as users_router

##################################### app setup #####################################

load_dotenv()

origins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5173/register", "http://localhost:5173/login", "http://localhost:5173/user", "http://127.0.0.1:5173/register", "http://127.0.0.1:5173/login", "http://127.0.0.1:5173/user"]

#settings = BaseConfig()

async def lifespan(app: FastAPI):
    app.client = AsyncIOMotorClient(os.environ['MONGODB_HOST'])
    app.db = app.client[os.environ['DB_NAME']]
    try:
        app.client.admin.command("ping")
        print("Pinged your deployment. You have successfully connected to MongoDB!")
        print("Mongo address:", os.environ['MONGODB_HOST'])
    except Exception as e:
        print(e)
    yield
    app.client.close()
app = FastAPI(lifespan=lifespan)

# middleware to connect with React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router, prefix="/users", tags=["users"])

@app.get("/")
async def get_root():
    return {"Message": "Root working!"}

##################################### definitions #####################################

# # class for defining account type - admin or user
# class AccType(str, Enum):
#     ADMIN = "admin"
#     USER = "user"

##################################### methods #####################################

# # setting a status code
# @app.get("/status", status_code=status.HTTP_208_ALREADY_REPORTED)
# async def raw_fa_response():
#     return {"message": "fastapi response"}

# # reading user agent by using the Header - extracting headers
# @app.get("/headers")
# async def read_headers(user_agent: Annotated[str | None, Header()] = None):
#     return {"user_agent": user_agent}
