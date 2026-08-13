from datetime import datetime
from typing import Optional
from app.schemas.base import BaseSchema
from app.schemas.participant import ParticipantRead


class ActionItemBase(BaseSchema):
    text: str
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: bool = False
    source_segment_id: Optional[str] = None


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseSchema):
    text: Optional[str] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    source_segment_id: Optional[str] = None


class ActionItemRead(ActionItemBase):
    id: str
    meeting_id: str
    assignee: Optional[ParticipantRead] = None
