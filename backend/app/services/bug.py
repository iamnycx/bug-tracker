from typing import Optional
from flask import current_app
from ..extensions import db
from ..models import Bug, User, Project
from ..core.state_machine import BugStatus, StateMachineError
from ..schema import BugCreate, BugUpdate


class BugService:
    """Service for bug operations."""

    @staticmethod
    def create_bug(data: BugCreate) -> Bug:
        """Create a new bug."""
        # Verify project exists
        project = Project.query.get(data.project_id)
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
        return Bug.query.get(bug_id)

    @staticmethod
    def list_bugs(
        project_id: Optional[int] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assignee_id: Optional[int] = None,
    ) -> list[Bug]:
        """List bugs with optional filtering."""
        query = Bug.query
        
        if project_id is not None:
            query = query.filter_by(project_id=project_id)
        if status is not None:
            query = query.filter_by(status=status)
        if priority is not None:
            query = query.filter_by(priority=priority)
        if assignee_id is not None:
            query = query.filter_by(assignee_id=assignee_id)
        
        return query.all()

    @staticmethod
    def update_bug(bug_id: int, data: BugUpdate) -> Bug:
        """Update a bug."""
        bug = Bug.query.get(bug_id)
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")
        
        if data.title is not None:
            bug.title = data.title
        if data.description is not None:
            bug.description = data.description
        if data.priority is not None:
            bug.priority = data.priority
        if data.assignee_id is not None:
            # Verify assignee exists
            user = User.query.get(data.assignee_id)
            if not user:
                raise ValueError(f"User {data.assignee_id} not found")
            bug.assignee_id = data.assignee_id
        if data.resolution_note is not None:
            bug.resolution_note = data.resolution_note
        
        db.session.commit()
        return bug

    @staticmethod
    def transition_bug(bug_id: int, next_status: str) -> Bug:
        """
        Transition a bug to a new status.
        
        Raises:
            ValueError: if bug not found
            StateMachineError: if transition is invalid
        """
        bug = Bug.query.get(bug_id)
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")
        
        try:
            next_status_enum = BugStatus(next_status)
        except ValueError:
            raise ValueError(f"Invalid status: {next_status}")
        
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
        bug = Bug.query.get(bug_id)
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")
        
        db.session.delete(bug)
        db.session.commit()
        return True
