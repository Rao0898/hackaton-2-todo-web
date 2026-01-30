from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import uuid
from pydantic import BaseModel

from ..models.user import User, UserCreate, UserRead
from ..database.database import get_session
from ..database.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


router = APIRouter()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__ident="2b")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password, ensuring it's not longer than 72 bytes which is bcrypt's limit"""
    # Bcrypt has a 72-byte password length limitation
    # We need to ensure the password doesn't exceed this limit
    if len(password.encode('utf-8')) > 72:
        raise ValueError("Password cannot be longer than 72 bytes")
    return pwd_context.hash(password)


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password"""
    # Validate password length before attempting verification
    if len(password.encode('utf-8')) > 72:
        return None  # Return None for overly long passwords to prevent bcrypt errors

    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    if not user or not verify_password(password, user.password_hash):
        return None

    return user


class LoginRequest(BaseModel):
    email: str
    password: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/register")
def register_user(user_create: UserCreate, session: Session = Depends(get_session)):
    """Register a new user and return user data with access token"""
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_create.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate password length before hashing (bcrypt limit is 72 bytes)
    if len(user_create.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be longer than 72 bytes"
        )

    # Hash the password
    hashed_password = get_password_hash(user_create.password)

    # Create new user
    db_user = User(
        email=user_create.email,
        name=user_create.name,
        password_hash=hashed_password
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    # Create access token for the newly registered user
    access_token = create_access_token(data={"sub": str(db_user.id)})

    # Return both user data and token
    return {
        "user": db_user,
        "token": access_token,
        "token_type": "bearer"
    }


@router.post("/login")
def login_user(login_request: LoginRequest, session: Session = Depends(get_session)):
    """Login a user and return user data with access token"""
    email = login_request.email
    password = login_request.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    # Validate password length to prevent bcrypt issues
    if len(password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be longer than 72 bytes"
        )

    user = authenticate_user(session, email, password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    # Return both user data and token
    return {
        "user": user,
        "token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout_user():
    """Logout a user (client-side token invalidation)"""
    # In a real implementation, you might want to add the token to a blacklist
    return {"message": "Successfully logged out"}