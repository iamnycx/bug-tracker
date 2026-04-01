from datetime import datetime
from ..extensions import db


class Comment(db.Model):
    """Comment model for bug communication and audit context."""
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    bug_id = db.Column(db.Integer, db.ForeignKey("bugs.id"), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    bug = db.relationship(
        "Bug",
        back_populates="comments",
        lazy=True,
    )
    author = db.relationship(
        "User",
        back_populates="comments",
        lazy=True,
    )

    def __repr__(self) -> str:
        return f"<Comment {self.id}: on bug {self.bug_id}>"
