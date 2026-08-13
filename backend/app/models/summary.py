import datetime
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    overview_text = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    source = Column(String, default="mock", nullable=False)  # "mock" or "llm"

    meeting = relationship("Meeting", back_populates="summary")
