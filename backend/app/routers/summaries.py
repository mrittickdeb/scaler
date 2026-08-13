from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.meeting import Meeting
from app.models.summary import Summary
from app.schemas.summary import SummaryRead
from app.services.summary_generation import generate_summary_for_transcript

router = APIRouter(prefix="/api/meetings/{meeting_id}/summary", tags=["Summaries"])


@router.get("", response_model=SummaryRead)
def get_summary(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found for this meeting")

    return summary


@router.post("/generate", response_model=SummaryRead)
def generate_summary(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participants = [p.name for p in meeting.participants]
    result = generate_summary_for_transcript("", participants)

    summary = db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
    if not summary:
        summary = Summary(
            meeting_id=meeting_id,
            overview_text=result["overview_text"],
            source=result["source"]
        )
        db.add(summary)
    else:
        summary.overview_text = result["overview_text"]
        summary.source = result["source"]

    db.commit()
    db.refresh(summary)
    return summary
