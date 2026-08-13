from typing import Optional
from app.schemas.base import BaseSchema


class ParticipantBase(BaseSchema):
    name: str
    avatar_url: Optional[str] = None
    is_speaker: bool = True


class ParticipantCreate(ParticipantBase):
    pass


class ParticipantRead(ParticipantBase):
    id: str
    meeting_id: str
