import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_speaker = Column(Boolean, default=True, nullable=False)

    meeting = relationship("Meeting", back_populates="participants")
    transcript_segments = relationship("TranscriptSegment", back_populates="speaker")
    assigned_action_items = relationship("ActionItem", back_populates="assignee")
