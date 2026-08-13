import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    assignee_id = Column(String, ForeignKey("participants.id", ondelete="SET NULL"), nullable=True, index=True)
    due_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    source_segment_id = Column(String, ForeignKey("transcript_segments.id", ondelete="SET NULL"), nullable=True)

    meeting = relationship("Meeting", back_populates="action_items")
    assignee = relationship("Participant", back_populates="assigned_action_items")
    source_segment = relationship("TranscriptSegment", back_populates="source_action_items")
