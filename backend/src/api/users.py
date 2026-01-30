from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from ..models.user import User, UserRead
from ..services.auth_service import get_current_user_id
from ..database.database import get_session


router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_current_user(current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Get the current user's information"""
    from uuid import UUID
    user_uuid = UUID(current_user_id)
    user = session.get(User, user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: str, current_user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    """Get a user by ID"""
    # Ensure users can only access their own data
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user"
        )

    from uuid import UUID
    user_uuid = UUID(user_id)
    user = session.get(User, user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user