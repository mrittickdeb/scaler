from datetime import datetime
from app.schemas.base import BaseSchema


class SummaryBase(BaseSchema):
    overview_text: str
    source: str = "mock"


class SummaryCreate(SummaryBase):
    pass


class SummaryRead(SummaryBase):
    id: str
    meeting_id: str
    generated_at: datetime
