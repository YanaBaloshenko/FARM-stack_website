import json
import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from bson import ObjectId

from backend.authentication import AuthHandler
from backend.models import User, CurrentUser, Login, UpdateUser

router = APIRouter()

# auth handler may comment out or change for testing w/o jwt
auth_handler = AuthHandler()

@router.put()
async def update_user(
    id: str,
    request: Request,
    user: UpdateUser = Body(...),
):
    try:
        id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Car {id} not found")
    car = {
        k: v
        for k, v in car.model_dump(by_alias=True).items()
        if v is not None and k != "_id"
    }

################################ post methods ################################
@router.post("/register", response_description="Register user")
async def register(request: Request, newUser: Login = Body(...)) -> User:
    # loading all the users from db
    users = request.app.db["users"]
    # getting hash of the password new user gave
    newUser.password = auth_handler.get_password_hash(newUser.password)
    # throwing an error if username exists in db
    if (# existing_username :=
        await users.find_one({"username": newUser["username"]})
        is not None
    ):
        raise HTTPException(
            status_code=409,
            detail="Username already taken"
        )
    # adding new user to a db
    new_user = await users.insert_one(newUser)
    created_user = await users.find_one({"_id": new_user.inserted_id})
    return created_user

@router.post("/login", response_description="Login user")
async def login(request: Request, loginUser: Login = Body(...)) -> str:
    # reading users from db
    users = request.app.db["users"]
    # checks users till it gets to given username
    user = await users.find_one({"username": loginUser.username})
    # error if there's no such user or passwd is wrong
    if (user is None) or (
        not auth_handler.verify_password(loginUser.password, user["password"])
    ):
        raise HTTPException(status_code=401, detail="Invalid username and/or password")
    # creates a token
    token = auth_handler.encode_token(str(user["_id"]), user["username"])
    # gives a response based on token
    response = JSONResponse(
        content={
            "token": token,
            "username": user["username"]
        }
    )
    return response

################################ get methods ################################
@router.get(
    "/me",
    response_description="Loggen in user data",
    response_model=CurrentUser
)
async def me(
    request: Request,
    response: Response,
    user_data=Depends(auth_handler.auth_wrapper)
):
    users = request.app.db["users"]
    currentUser = await users.find_one(
        {"_id": ObjectId(user_data["user_id"])}
    )
    return currentUser

# # Listing users only to authenticated ones
# @router.get("/list", response_description="List all users")
# async def list_users(request: Request, user_data=Depends(auth_hadler.auth_wrapper)):
#     users = json.loads(open("users.json").read())["users"]
#     return UsersList(users=users)
