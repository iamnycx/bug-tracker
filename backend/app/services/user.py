from typing import Optional
from ..extensions import db
from ..models import User
from ..schema import UserCreate, UserRead


class UserService:
    """Service for user operations."""

    @staticmethod
    def create_user(data: UserCreate) -> User:
        """Create a new user."""
        existing = User.query.filter_by(email=data.email).first()
        if existing:
            raise ValueError(f"User with email {data.email} already exists")
        
        user = User(name=data.name, email=data.email)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        """Get user by ID."""
        return User.query.get(user_id)

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email."""
        return User.query.filter_by(email=email).first()

    @staticmethod
    def list_users() -> list[User]:
        """List all users."""
        return User.query.all()

    @staticmethod
    def delete_user(user_id: int) -> bool:
        """Delete a user."""
        user = User.query.get(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        db.session.delete(user)
        db.session.commit()
        return True
