from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.meeting import Meeting
from app.models.action_item import ActionItem
from app.schemas.action_item import ActionItemRead, ActionItemCreate, ActionItemUpdate

router = APIRouter(tags=["Action Items"])


@router.get("/api/meetings/{meeting_id}/action-items", response_model=List[ActionItemRead])
def get_action_items(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    items = db.query(ActionItem).filter(ActionItem.meeting_id == meeting_id).all()
    return items


@router.post("/api/meetings/{meeting_id}/action-items", response_model=ActionItemRead, status_code=status.HTTP_201_CREATED)
def create_action_item(
    meeting_id: str,
    item_in: ActionItemCreate,
    db: Session = Depends(get_db)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    action_item = ActionItem(
        meeting_id=meeting_id,
        text=item_in.text,
        assignee_id=item_in.assignee_id,
        due_date=item_in.due_date,
        is_completed=item_in.is_completed,
        source_segment_id=item_in.source_segment_id
    )
    db.add(action_item)
    db.commit()
    db.refresh(action_item)
    return action_item


@router.patch("/api/action-items/{action_item_id}", response_model=ActionItemRead)
def update_action_item(
    action_item_id: str,
    item_in: ActionItemUpdate,
    db: Session = Depends(get_db)
):
    action_item = db.query(ActionItem).filter(ActionItem.id == action_item_id).first()
    if not action_item:
        raise HTTPException(status_code=404, detail="Action item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(action_item, field, value)

    db.commit()
    db.refresh(action_item)
    return action_item


@router.delete("/api/action-items/{action_item_id}", status_code=status.HTTP_200_OK)
def delete_action_item(
    action_item_id: str,
    db: Session = Depends(get_db)
):
    action_item = db.query(ActionItem).filter(ActionItem.id == action_item_id).first()
    if not action_item:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(action_item)
    db.commit()
    return {"message": "Action item deleted successfully", "id": action_item_id}
