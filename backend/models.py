import datetime
from datetime import datetime
from datetime import date
from typing import Optional, Annotated, List
from pydantic import BaseModel, ConfigDict, Field, BeforeValidator, field_validator
PyObjectId = Annotated[str, BeforeValidator(str)]

###################################### User ######################################
class User(BaseModel):
    # in mongodb its _id but in python its reserved so an alias is used
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    username: str = Field(..., min_length=3, max_length=15)
    password: str = Field(...) # limitations?
    name: str = Field(...)
    email: str = Field(...)
    iban: int = Field(..., gt=19, lt=35)

    @field_validator("username")
    @classmethod
    def check_username(cls, v: str) -> str:
        return v.title()
    
    @field_validator("name")
    @classmethod
    def check_name(cls, v: str) -> str:
        return v.title()
    
    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return v.title()
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "username": "username",
                "password": "insecurepassword",
                "name": "Some One",
                "email": "example@email.example",
                "iban": 12345678901234567890,
            }
        },
    )

class Login(BaseModel):
    username: str = Field(...)
    password: str = Field(...)

class CurrentUser(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    username: str = Field(...)

class UpdateUser(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = Field(...)
    email: Optional[str] = Field(...)
    iban: Optional[int] = Field(..., gt=19, lt=35)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "username": "username",
                "password": "insecurepassword",
                "name": "Some One",
                "email": "example@email.example",
                "iban": 12345678901234567890
            }
        },
    )

###################################### Post ######################################
class Post(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str = Field(...)
    date_created: str = Field(..., min_length=10, max_length=10)
    text: str = Field(...)

    @field_validator("user_id")
    @classmethod
    def check_user_id(cls, v: str) -> str:
        return v.title()
    
    @field_validator("date_created")
    @classmethod
    def check_date_created(cls, v: str) -> str:
        return v.title()
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "user_id": "1",
                "date_created": "24-11-2024",
                "text": "example text",
            }
        },
    )

class PostCollection(BaseModel):
    posts: List[Post]

# class PostCollectionPagination(PostCollection):
#     page: int = Field(ge=1, default=1)
#     has_more: bool
