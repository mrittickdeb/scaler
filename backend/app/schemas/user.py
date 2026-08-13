from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema


class UserBase(BaseSchema):
    name: str
    email: str
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: str
    created_at: datetime
