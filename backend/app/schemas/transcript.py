from typing import Optional
from app.schemas.base import BaseSchema
from app.schemas.participant import ParticipantRead


class TranscriptSegmentBase(BaseSchema):
    speaker_id: Optional[str] = None
    start_time: float
    end_time: float
    text: str
    sequence_order: int


class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass


class TranscriptSegmentRead(TranscriptSegmentBase):
    id: str
    meeting_id: str
    speaker: Optional[ParticipantRead] = None
