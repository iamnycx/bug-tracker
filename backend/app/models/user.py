from datetime import datetime, timezone
from ..extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(db.Model):
    """User model for bug tracker actors/assignees."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    credential_password = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(50), nullable=False, default="member", index=True)
    is_blocked = db.Column(db.Boolean, nullable=False, default=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(
        db.DateTime, 
        nullable=False, 
        default=utcnow,
        onupdate=utcnow
    )

    # Relationships
    assigned_bugs = db.relationship(
        "Bug",
        back_populates="assignee",
        foreign_keys="Bug.assignee_id",
        lazy=True,
    )
    comments = db.relationship(
        "Comment",
        back_populates="author",
        lazy=True,
    )

    def __repr__(self) -> str:
        return f"<User {self.id}: {self.email}>"
