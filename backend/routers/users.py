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

################################ post methods ################################
@router.post("/register", response_description="Register user")
async def register(request: Request, newUser: Login = Body(...)) -> User:
    users = request.app.db["users"]
    # hash the password before inserting it into MongoDB
    newUser.password = auth_handler.get_password_hash(newUser.password)
    newUser = newUser.model_dump()
    # check existing user or email 409 Conflict:
    if (
        existing_username := await users.find_one({"username": newUser["username"]})
        is not None
    ):
        raise HTTPException(
            status_code=409,
            detail=f"User with username {newUser['username']} already exists",
        )
    new_user = await users.insert_one(newUser)
    created_user = await users.find_one({"_id": new_user.inserted_id})
    return created_user

@router.post("/login", response_description="Login user")
async def login(request: Request, loginUser: Login = Body(...)) -> str:
    users = request.app.db["users"]
    user = await users.find_one({"username": loginUser.username})
    if (user is None) or (
        not auth_handler.verify_password(loginUser.password, user["password"])
    ):
        raise HTTPException(status_code=401, detail="Invalid username and/or password")
    token = auth_handler.encode_token(str(user["_id"]), user["username"])
    response = JSONResponse(
    content={
        "token": token,
        "username": user["username"]
    })
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

################################ put methods ################################
@router.put("/me", response_description="Update user data")
async def update_user(
    request: Request,
    current_user_data=Depends(auth_handler.auth_wrapper),
    user_data: UpdateUser = Body(...),
):
    users = request.app.db["users"]

    try:
        id = ObjectId(current_user_data["user_id"])
    except Exception:
        raise HTTPException(status_code=404, detail=f"User not found")
    user = await users.find_one({"_id": id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # prepare data for updating
    update_data = user_data.model_dump(exclude_unset=True)

    # update user in db
    updated_user = await users.update_one({"_id": id}, {"$set": update_data})

    if updated_user.modified_count == 0:
        raise HTTPException(status_code=400, detail="No updates made")
    
    updated_user_data = await users.find_one({"_id": id})

    return updated_user_data

# # Listing users only to authenticated ones
# @router.get("/list", response_description="List all users")
# async def list_users(request: Request, user_data=Depends(auth_hadler.auth_wrapper)):
#     users = json.loads(open("users.json").read())["users"]
#     return UsersList(users=users)
