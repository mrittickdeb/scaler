from app.schemas.base import BaseSchema


class OutlineItemBase(BaseSchema):
    title: str
    start_time: float
    sequence_order: int


class OutlineItemCreate(OutlineItemBase):
    pass


class OutlineItemRead(OutlineItemBase):
    id: str
    meeting_id: str
