import datetime
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    duration_seconds = Column(Integer, default=0, nullable=False)
    audio_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
    
    owner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    owner = relationship("User", back_populates="meetings")
    participants = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")
    transcript_segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan", order_by="TranscriptSegment.sequence_order")
    summary = relationship("Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    outline_items = relationship("OutlineItem", back_populates="meeting", cascade="all, delete-orphan", order_by="OutlineItem.sequence_order")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
