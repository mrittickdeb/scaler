from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy import or_, desc, asc
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.meeting import Meeting
from app.models.user import User
from app.models.participant import Participant
from app.models.transcript import TranscriptSegment
from app.schemas.meeting import MeetingListRead, MeetingDetailRead, MeetingCreate, MeetingUpdate

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])


def get_default_user_id(db: Session) -> str:
    user = db.query(User).first()
    if not user:
        # Create default user if none exists
        user = User(name="Alex Chen", email="alex@echonotes.ai", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user.id


@router.get("", response_model=List[MeetingListRead])
def list_meetings(
    search: Optional[str] = Query(None, description="Search by title or participant name"),
    sort: Optional[str] = Query("recent", description="Sort order: recent, oldest, longest, shortest"),
    participant: Optional[str] = Query(None, description="Filter by participant name"),
    db: Session = Depends(get_db)
):
    query = db.query(Meeting).options(joinedload(Meeting.participants))

    if search:
        search_pattern = f"%{search}%"
        # Match meeting title or participant name
        query = query.outerjoin(Meeting.participants).filter(
            or_(
                Meeting.title.ilike(search_pattern),
                Participant.name.ilike(search_pattern)
            )
        ).distinct()

    if participant:
        part_pattern = f"%{participant}%"
        query = query.outerjoin(Meeting.participants).filter(
            Participant.name.ilike(part_pattern)
        ).distinct()

    if sort == "recent":
        query = query.order_by(desc(Meeting.date))
    elif sort == "oldest":
        query = query.order_by(asc(Meeting.date))
    elif sort == "longest":
        query = query.order_by(desc(Meeting.duration_seconds))
    elif sort == "shortest":
        query = query.order_by(asc(Meeting.duration_seconds))
    else:
        query = query.order_by(desc(Meeting.date))

    return query.all()


from app.services.transcript_parser import parse_transcript_text
from app.services.summary_generation import generate_summary_for_transcript
from app.models.transcript import TranscriptSegment
from app.models.summary import Summary
from app.models.outline import OutlineItem
from app.models.action_item import ActionItem

@router.post("", response_model=MeetingDetailRead, status_code=status.HTTP_201_CREATED)
def create_meeting(
    meeting_in: MeetingCreate,
    db: Session = Depends(get_db)
):
    owner_id = meeting_in.owner_id or get_default_user_id(db)

    # Calculate duration from transcript text if provided
    segments_raw = parse_transcript_text(meeting_in.transcript_text) if meeting_in.transcript_text else []
    duration = int(segments_raw[-1]["end_time"]) if segments_raw else (meeting_in.duration_seconds or 120)

    meeting = Meeting(
        title=meeting_in.title,
        date=meeting_in.date,
        duration_seconds=duration,
        audio_url=meeting_in.audio_url or "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        owner_id=owner_id
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # Process participants
    participant_map = {}
    if meeting_in.participants:
        for p_in in meeting_in.participants:
            participant = Participant(
                meeting_id=meeting.id,
                name=p_in.name,
                avatar_url=p_in.avatar_url,
                is_speaker=p_in.is_speaker
            )
            db.add(participant)
            db.commit()
            db.refresh(participant)
            participant_map[participant.name.lower()] = participant

    # Save parsed transcript segments
    created_segments = []
    if segments_raw:
        for s in segments_raw:
            spk_name = s["speaker_name"]
            spk_key = spk_name.lower()
            if spk_key not in participant_map:
                p_new = Participant(meeting_id=meeting.id, name=spk_name, is_speaker=True)
                db.add(p_new)
                db.commit()
                db.refresh(p_new)
                participant_map[spk_key] = p_new

            seg = TranscriptSegment(
                meeting_id=meeting.id,
                speaker_id=participant_map[spk_key].id,
                start_time=s["start_time"],
                end_time=s["end_time"],
                text=s["text"],
                sequence_order=s["sequence_order"]
            )
            db.add(seg)
            created_segments.append(seg)
        db.commit()

    # Generate Summary, Outline, Action Items
    all_participant_names = [p.name for p in db.query(Participant).filter(Participant.meeting_id == meeting.id).all()]
    gen_result = generate_summary_for_transcript(meeting_in.transcript_text or "", all_participant_names)

    db.add(Summary(
        meeting_id=meeting.id,
        overview_text=gen_result["overview_text"],
        source=gen_result["source"]
    ))

    for item in gen_result.get("outline_items", []):
        db.add(OutlineItem(
            meeting_id=meeting.id,
            title=item["title"],
            start_time=item["start_time"],
            sequence_order=item["sequence_order"]
        ))

    for ai in gen_result.get("action_items", []):
        assignee_p = participant_map.get(ai.get("assignee_name", "").lower())
        db.add(ActionItem(
            meeting_id=meeting.id,
            text=ai["text"],
            assignee_id=assignee_p.id if assignee_p else None,
            is_completed=ai.get("is_completed", False),
            source_segment_id=created_segments[0].id if created_segments else None
        ))

    db.commit()

    return get_meeting(meeting.id, db)


@router.get("/{meeting_id}", response_model=MeetingDetailRead)
def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).options(
        joinedload(Meeting.owner),
        joinedload(Meeting.participants),
        joinedload(Meeting.summary),
        joinedload(Meeting.outline_items),
        joinedload(Meeting.action_items),
        joinedload(Meeting.transcript_segments).joinedload(TranscriptSegment.speaker)
    ).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return meeting


@router.patch("/{meeting_id}", response_model=MeetingDetailRead)
def update_meeting(
    meeting_id: str,
    meeting_in: MeetingUpdate,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    update_data = meeting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(meeting, field, value)

    db.commit()

    return get_meeting(meeting_id, db)


@router.post("/{meeting_id}/ask")
def ask_meeting(
    meeting_id: str,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    question = payload.get("question", "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    meeting = db.query(Meeting).options(
        joinedload(Meeting.transcript_segments).joinedload(TranscriptSegment.speaker)
    ).filter(Meeting.id == meeting_id).first()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Concatenate transcript segments into context string
    transcript_lines = []
    for seg in meeting.transcript_segments:
        spk = seg.speaker.name if seg.speaker else "Speaker"
        transcript_lines.append(f"[{int(seg.start_time)}s] {spk}: {seg.text}")
    
    context_text = "\n".join(transcript_lines)

    from app.config import settings
    from app.services.summary_generation import call_gemini_api

    if settings.ENABLE_LLM_GENERATION and (settings.GEMINI_API_KEY or settings.OPENAI_API_KEY):
        try:
            prompt = (
                f"You are EchoNotes AI Meeting Assistant. Answer the user's question strictly based on the provided meeting transcript.\n\n"
                f"Meeting Title: {meeting.title}\n"
                f"Transcript:\n{context_text[:4000]}\n\n"
                f"User Question: {question}"
            )
            answer = call_gemini_api(prompt)
            return {"answer": answer, "source": "llm", "question": question}
        except Exception as e:
            print(f"[GEMINI ASK FALLBACK] {e}")

    # Smart context-aware mock response
    question_lower = question.lower()
    matching_lines = [line for line in transcript_lines if any(w in line.lower() for w in question_lower.split() if len(w) > 3)]
    
    if matching_lines:
        mock_answer = f"Based on the transcript for '{meeting.title}', here is the relevant discussion:\n\n" + "\n".join(matching_lines[:3])
    else:
        mock_answer = (
            f"In '{meeting.title}', the team discussed project milestones, key blockers, and action items. "
            f"Refer to the transcript or summary tab for detailed timestamps."
        )

    return {
        "answer": mock_answer,
        "source": "mock",
        "question": question
    }


@router.delete("/{meeting_id}", status_code=status.HTTP_200_OK)
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted successfully", "id": meeting_id}
