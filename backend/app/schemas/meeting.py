from datetime import datetime
from typing import List, Optional
from app.schemas.base import BaseSchema
from app.schemas.user import UserRead
from app.schemas.participant import ParticipantRead, ParticipantCreate
from app.schemas.transcript import TranscriptSegmentRead
from app.schemas.summary import SummaryRead
from app.schemas.outline import OutlineItemRead
from app.schemas.action_item import ActionItemRead


class MeetingBase(BaseSchema):
    title: str
    date: datetime
    duration_seconds: int = 0
    audio_url: Optional[str] = None


class MeetingCreate(MeetingBase):
    owner_id: Optional[str] = None
    participants: Optional[List[ParticipantCreate]] = []
    transcript_text: Optional[str] = None  # Optional raw transcript when creating via upload/paste


class MeetingUpdate(BaseSchema):
    title: Optional[str] = None
    date: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    audio_url: Optional[str] = None


class MeetingListRead(MeetingBase):
    id: str
    created_at: datetime
    updated_at: datetime
    owner_id: str
    participants: List[ParticipantRead] = []


class MeetingDetailRead(MeetingListRead):
    owner: UserRead
    summary: Optional[SummaryRead] = None
    outline_items: List[OutlineItemRead] = []
    action_items: List[ActionItemRead] = []
    transcript_segments: List[TranscriptSegmentRead] = []
