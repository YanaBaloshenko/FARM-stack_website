import json
import uuid
from fastapi import APIRouter, Body, Depends, HTTPException, Request, status, Response, Form
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from bson import ObjectId

from backend.authentication import AuthHandler
from backend.models import Post, PostCollection

router = APIRouter()

# auth handler may comment out or change for testing w/o jwt
auth_handler = AuthHandler()

################################ post methods ################################
@router.post(
    "/",
    response_description="Add new post",
    response_model=Post,
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def add_post(
    request: Request,
    date_created: str = Form("date_created"),
    text: str = Form("text"),
    user=Depends(auth_handler.auth_wrapper)
):
    post = Post(
        date_created=date_created,
        text=text,
        user_id=user["user_id"]
    )
    posts = request.app.db["posts"]
    document = post.model_dump(by_alias=True, exclude=["id"])
    inserted = await posts.insert_one(document)
    return await posts.find_one({"_id": inserted.inserted_id})

################################ get methods ################################
@router.get(
    "/{user_id}",
    response_description="List all user posts",
    response_model=PostCollection,
    response_model_by_alias=False,
)
async def list_posts(request: Request, user=Depends(auth_handler.auth_wrapper)):
    posts = request.app.db["posts"]
    results = []
    cursor = posts.find({"user_id": ObjectId(user["user_id"])}).sort("date_created")
    async for document in cursor:
        results.append(document)
    return PostCollection(posts=results)

# by id
@router.get(
    "/{id}",
    response_description="Get a single post by ID",
    response_model=Post,
    response_model_by_alias=False,
)
async def show_post(id: str, request: Request):
    posts = request.app.db["posts"]
    try:
        id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"post {id} not found")
    if (post := await posts.find_one({"_id": ObjectId(id)})) is not None:
        return post
    raise HTTPException(status_code=404, detail=f"post with {id} not found")

################################ delete methods ################################
@router.delete("/{id}", response_description="Delete a post")
async def delete_post(
    id: str, request: Request, user=Depends(auth_handler.auth_wrapper)
):
    try:
        id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"post {id} not found")
    posts = request.app.db["posts"]
    delete_result = await posts.delete_one({"_id": id})
    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    raise HTTPException(status_code=404, detail=f"post with {id} not found")
