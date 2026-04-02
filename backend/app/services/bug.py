from typing import Optional

from flask import current_app

from ..core.state_machine import BugStatus, StateMachineError
from ..extensions import db
from ..models import Bug, Project, User
from ..schema import BugCreate, BugUpdate


class BugService:
    """Service for bug operations."""

    @staticmethod
    def _enforce_member_update_permissions(bug: Bug, data: BugUpdate) -> None:
        """Members can only set resolution_note while bug is in_progress."""
        if (
            data.title is not None
            or data.description is not None
            or data.priority is not None
            or data.assignee_id is not None
        ):
            raise ValueError("Members can only update resolution_note")

        if data.resolution_note is None:
            raise ValueError("Members can only update resolution_note")

        if bug.get_status() != BugStatus.IN_PROGRESS:
            raise ValueError("Members can only update in_progress bugs")

    @staticmethod
    def _enforce_member_transition_permissions(bug: Bug, next_status: BugStatus) -> None:
        """Members can only move bugs from in_progress to resolved."""
        if bug.get_status() != BugStatus.IN_PROGRESS or next_status != BugStatus.RESOLVED:
            raise ValueError("Members can only resolve in_progress bugs")

    @staticmethod
    def create_bug(data: BugCreate) -> Bug:
        """Create a new bug."""
        project = db.session.get(Project, data.project_id)
        if not project:
            raise ValueError(f"Project {data.project_id} not found")

        bug = Bug(
            project_id=data.project_id,
            title=data.title,
            description=data.description,
            priority=data.priority,
            status=BugStatus.OPEN.value,
        )
        db.session.add(bug)
        db.session.commit()
        return bug

    @staticmethod
    def get_bug_by_id(bug_id: int) -> Optional[Bug]:
        """Get bug by ID."""
        return db.session.get(Bug, bug_id)

    @staticmethod
    def list_bugs(
        project_id: Optional[int] = None,
        status: Optional[BugStatus | str] = None,
        priority: Optional[str] = None,
        assignee_id: Optional[int] = None,
    ) -> list[Bug]:
        """List bugs with optional filtering."""
        query = Bug.query

        if project_id is not None:
            query = query.filter_by(project_id=project_id)
        if status is not None:
            status_value = (
                status.value if isinstance(status, BugStatus) else BugStatus(status).value
            )
            query = query.filter_by(status=status_value)
        if priority is not None:
            query = query.filter_by(priority=priority)
        if assignee_id is not None:
            query = query.filter_by(assignee_id=assignee_id)

        return query.all()

    @staticmethod
    def update_bug(bug_id: int, data: BugUpdate, actor_role: str = "admin") -> Bug:
        """Update a bug."""
        bug = db.session.get(Bug, bug_id)
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")

        if actor_role == "member":
            BugService._enforce_member_update_permissions(bug, data)
        
        if data.title is not None:
            bug.title = data.title
        if data.description is not None:
            bug.description = data.description
        if data.priority is not None:
            bug.priority = data.priority
        if data.assignee_id is not None:
            # Verify assignee exists
            user = db.session.get(User, data.assignee_id)
            if not user:
                raise ValueError(f"User {data.assignee_id} not found")
            bug.assignee_id = data.assignee_id
        if data.resolution_note is not None:
            bug.resolution_note = data.resolution_note
        
        db.session.commit()
        return bug

    @staticmethod
    def transition_bug(
        bug_id: int,
        next_status: BugStatus | str,
        actor_role: str = "admin",
    ) -> Bug:
        """
        Transition a bug to a new status.
        
        Raises:
            ValueError: if bug not found
            StateMachineError: if transition is invalid
        """
        bug = db.session.get(Bug, bug_id)
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")
        
        try:
            next_status_enum = (
                next_status if isinstance(next_status, BugStatus) else BugStatus(next_status)
            )
        except ValueError as exc:
            raise ValueError(f"Invalid status: {next_status}") from exc

        if actor_role == "member":
            BugService._enforce_member_transition_permissions(bug, next_status_enum)
        
        try:
            bug.transition(next_status_enum)
            db.session.commit()
            return bug
        except StateMachineError as e:
            current_app.logger.warning(f"State machine error for bug {bug_id}: {str(e)}")
            raise

    @staticmethod
    def delete_bug(bug_id: int) -> bool:
        """Delete a bug."""
        bug = db.session.get(Bug, bug_id)
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")
        
        db.session.delete(bug)
        db.session.commit()
        return True
