from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.schemas.transcript import TranscriptSegmentRead

router = APIRouter(prefix="/api/meetings/{meeting_id}/transcript", tags=["Transcripts"])


@router.get("", response_model=List[TranscriptSegmentRead])
def get_transcript(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    segments = db.query(TranscriptSegment).filter(
        TranscriptSegment.meeting_id == meeting_id
    ).order_by(TranscriptSegment.sequence_order.asc()).all()

    return segments


@router.post("/upload")
def upload_transcript(
    meeting_id: str,
    transcript_text: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Parsing logic will be enhanced in Phase 5
    return {"message": "Transcript uploaded successfully", "meeting_id": meeting_id, "character_count": len(transcript_text)}
