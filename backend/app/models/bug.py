from datetime import datetime
from ..extensions import db
from ..core.state_machine import BugStatus, transition_state, StateMachineError


class Bug(db.Model):
    """Bug model with enforced state machine lifecycle."""
    __tablename__ = "bugs"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(
        db.String(20),
        nullable=False,
        default=BugStatus.OPEN.value,
        index=True,
    )
    priority = db.Column(db.String(20), nullable=False, default="medium")  # low, medium, high, critical
    assignee_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    resolution_note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    project = db.relationship(
        "Project",
        back_populates="bugs",
        lazy=True,
    )
    assignee = db.relationship(
        "User",
        back_populates="assigned_bugs",
        foreign_keys=[assignee_id],
        lazy=True,
    )
    comments = db.relationship(
        "Comment",
        back_populates="bug",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def get_status(self) -> BugStatus:
        """Get the current status as an enum."""
        return BugStatus(self.status)

    def transition(self, next_status: BugStatus) -> None:
        """
        Transition to a new status, enforcing state machine rules.
        
        Raises:
            StateMachineError: if the transition is invalid
        """
        current = self.get_status()
        new_status = transition_state(
            current_status=current,
            next_status=next_status,
            assignee_id=self.assignee_id,
            resolution_note=self.resolution_note,
        )
        self.status = new_status.value

    def __repr__(self) -> str:
        return f"<Bug {self.id}: {self.title}>"
