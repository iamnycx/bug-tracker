import pytest

from app.core.state_machine import BugStatus, StateMachineError
from app.extensions import db
from app.models import Bug, Comment, Project, User
from app.schema import BugCreate, ProjectCreate, UserCreate
from app.services import BugService, CommentService, ProjectService, UserService


def test_model_reprs_and_relationships(app) -> None:
    with app.app_context():
        project = ProjectService.create_project(ProjectCreate(name="Core", description="Core project"))
        user = UserService.create_user(
            UserCreate(name="Alice", email="alice@example.com", password="password123")
        )
        bug = BugService.create_bug(
            BugCreate(
                project_id=project.id,
                title="Broken login",
                description="Login fails",
                priority="high",
            )
        )
        comment = CommentService.create_comment(bug.id, user.id, "Investigating")

        loaded_bug = db.session.get(Bug, bug.id)
        loaded_project = db.session.get(Project, project.id)
        loaded_user = db.session.get(User, user.id)
        loaded_comment = db.session.get(Comment, comment.id)

        assert repr(loaded_project) == f"<Project {project.id}: {project.name}>"
        assert repr(loaded_user) == f"<User {user.id}: {user.email}>"
        assert repr(loaded_bug) == f"<Bug {bug.id}: {bug.title}>"
        assert repr(loaded_comment) == f"<Comment {comment.id}: on bug {bug.id}>"
        assert loaded_bug.project.id == project.id
        assert loaded_bug.comments[0].id == comment.id
        assert loaded_user.comments[0].id == comment.id
        assert loaded_project.bugs[0].id == bug.id


def test_bug_model_transition_enforces_state_machine(app) -> None:
    with app.app_context():
        project = ProjectService.create_project(ProjectCreate(name="Core", description="Core project"))
        assignee = UserService.create_user(
            UserCreate(name="Assignee", email="assignee@example.com", password="password123")
        )
        bug = BugService.create_bug(
            BugCreate(
                project_id=project.id,
                title="Broken login",
                description="Login fails",
                priority="high",
            )
        )

        loaded_bug = db.session.get(Bug, bug.id)
        assert loaded_bug.get_status() is BugStatus.OPEN

        loaded_bug.assignee_id = assignee.id
        loaded_bug.transition(BugStatus.IN_PROGRESS)
        assert loaded_bug.status == BugStatus.IN_PROGRESS.value

        with pytest.raises(StateMachineError):
            loaded_bug.transition(BugStatus.CLOSED)

        loaded_bug.resolution_note = "Fixed"
        loaded_bug.transition(BugStatus.RESOLVED)
        loaded_bug.transition(BugStatus.CLOSED)
        assert loaded_bug.status == BugStatus.CLOSED.value
