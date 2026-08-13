import uuid
from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker_id = Column(String, ForeignKey("participants.id", ondelete="SET NULL"), nullable=True, index=True)
    start_time = Column(Float, nullable=False, index=True)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    sequence_order = Column(Integer, nullable=False, index=True)

    meeting = relationship("Meeting", back_populates="transcript_segments")
    speaker = relationship("Participant", back_populates="transcript_segments")
    source_action_items = relationship("ActionItem", back_populates="source_segment")
