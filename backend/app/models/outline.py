import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class OutlineItem(Base):
    __tablename__ = "outline_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)
    sequence_order = Column(Integer, nullable=False, index=True)

    meeting = relationship("Meeting", back_populates="outline_items")
