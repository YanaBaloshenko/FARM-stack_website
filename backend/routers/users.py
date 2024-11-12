import json
import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from backend.authentication import AuthHandler
from backend.models import UserBase, UserIn, UserOut, UsersList

router = APIRouter()
# auth handler may comment out or change for testing w/o jwt
auth_hadler = AuthHandler()

# registering new users
@router.post("/register", response_description="Register user")
async def register(request: Request, newUser: UserIn = Body(...)) -> UserBase:
    # loading all the users from db
    users = json.loads(open("users.json").read())["users"]
    # getting hash of the password new user gave
    newUser.password = auth_hadler.get_password_hash(newUser.password)
    # throwing an error if username exists in db
    if any(user["username"] == newUser.username for user in users):
        raise HTTPException(status_code=409, detail="Username already taken")
    # encoding new user data to json
    newUser = jsonable_encoder(newUser)
    newUser["id"] = str(uuid. uuid4())
    # adding new user to a db
    users.append(newUser)
    with open ("users.json", "w") as f:
        json.dump({"users": users}, f, indent=4)
    return newUser

@router.post("/login", response_description="Login user")
async def login(request: Request, loginUser: UserIn = Body(...)) -> str:
    # reading users from db
    users = json.loads(open("users.json").read())["users"]
    # checks users till it gets to given username
    user = next(
        (user for user in users if user["username"] == loginUser.username), None
    )
    # error if there's no such user or passwd is wrong
    if (user is None) or (
        not auth_hadler.verify_password(loginUser.password, user["password"])
    ):
        raise HTTPException(status_code=401, detail="Invalid username and/or password")
    # creates a token
    token = auth_hadler.encode_token(str(user["id"]), user["username"])
    # gives a response based on token
    response = JSONResponse(content={"token": token})
    return response

# Listing users only to authenticated ones
@router.get("/list", response_description="List all users")
async def list_users(request: Request, user_data=Depends(auth_hadler.auth_wrapper)):
    users = json.loads(open("users.json").read())["users"]
    return UsersList(users=users)
