from datetime import datetime, timezone
from ..extensions import db


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Project(db.Model):
    """Project model for logical grouping of bugs."""
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=utcnow,
        onupdate=utcnow
    )

    # Relationships
    bugs = db.relationship(
        "Bug",
        back_populates="project",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Project {self.id}: {self.name}>"
