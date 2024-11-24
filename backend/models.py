import datetime
from datetime import datetime
from datetime import date
from typing import Optional, Annotated, List
from pydantic import BaseModel, ConfigDict, Field, BeforeValidator, field_validator
PyObjectId = Annotated[str, BeforeValidator(str)]

class User(BaseModel):
    # in mongodb its _id but in python its reserved so an alias is used
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    username: str = Field(..., min_length=3, max_length=15)
    password: str = Field(...) # limitations?
    name: str = Field(...)
    email: str = Field(...)
    iban: int = Field(..., gt=19, lt=35)

# class UserIn(BaseModel):
#     username: str = Field(..., min_length=3, max_length=15)
#     password: str = Field(...)

# class UserOut(BaseModel):
#     id: str = Field(...)
#     username: str = Field( ..., min_length=3, max_length=15)
    
# class UsersList(BaseModel):
#     users: List[UserOut]

class Post(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str = Field(...) # or objectid again
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
