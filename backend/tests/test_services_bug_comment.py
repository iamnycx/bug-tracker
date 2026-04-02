import pytest

from app.core.state_machine import BugStatus, StateMachineError
from app.schema import BugCreate, BugUpdate, ProjectCreate, UserCreate
from app.services import BugService, CommentService, ProjectService, UserService


def test_bug_service_create_list_update_transition_and_delete(app) -> None:
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
        assert bug.status == BugStatus.OPEN.value
        assert BugService.get_bug_by_id(bug.id).id == bug.id

        listed = BugService.list_bugs(project_id=project.id, status=BugStatus.OPEN.value)
        assert [item.id for item in listed] == [bug.id]

        updated = BugService.update_bug(
            bug.id,
            BugUpdate(
                title="Broken login v2",
                description="Login fails hard",
                priority="critical",
                assignee_id=assignee.id,
                resolution_note="Investigating",
            ),
        )
        assert updated.title == "Broken login v2"
        assert updated.assignee_id == assignee.id
        assert updated.resolution_note == "Investigating"

        with pytest.raises(StateMachineError):
            BugService.transition_bug(bug.id, BugStatus.RESOLVED.value)

        transitioned = BugService.transition_bug(bug.id, BugStatus.IN_PROGRESS.value)
        assert transitioned.status == BugStatus.IN_PROGRESS.value

        transitioned = BugService.transition_bug(bug.id, BugStatus.RESOLVED.value)
        assert transitioned.status == BugStatus.RESOLVED.value

        transitioned = BugService.transition_bug(bug.id, BugStatus.CLOSED.value)
        assert transitioned.status == BugStatus.CLOSED.value

        assert BugService.delete_bug(bug.id) is True
        assert BugService.get_bug_by_id(bug.id) is None


def test_bug_service_rejects_missing_foreign_keys(app) -> None:
    with app.app_context():
        project = ProjectService.create_project(ProjectCreate(name="Core", description="Core project"))
        bug = BugService.create_bug(
            BugCreate(
                project_id=project.id,
                title="Broken login",
                description="Login fails",
                priority="high",
            )
        )

        try:
            BugService.create_bug(
                BugCreate(
                    project_id=9999,
                    title="Missing project",
                    description="No project",
                    priority="low",
                )
            )
        except ValueError as exc:
            assert str(exc) == "Project 9999 not found"
        else:
            raise AssertionError("Expected missing project to fail")

        try:
            BugService.update_bug(bug.id, BugUpdate(assignee_id=9999))
        except ValueError as exc:
            assert str(exc) == "User 9999 not found"
        else:
            raise AssertionError("Expected missing assignee to fail")

        try:
            BugService.update_bug(9999, BugUpdate(title="Nope"))
        except ValueError as exc:
            assert str(exc) == "Bug 9999 not found"
        else:
            raise AssertionError("Expected missing bug update to fail")

        try:
            BugService.transition_bug(9999, BugStatus.OPEN.value)
        except ValueError as exc:
            assert str(exc) == "Bug 9999 not found"
        else:
            raise AssertionError("Expected missing bug transition to fail")

        try:
            BugService.transition_bug(bug.id, "not-a-status")
        except ValueError as exc:
            assert str(exc) == "Invalid status: not-a-status"
        else:
            raise AssertionError("Expected invalid status to fail")


def test_comment_service_crud_and_validation(app) -> None:
    with app.app_context():
        project = ProjectService.create_project(ProjectCreate(name="Core", description="Core project"))
        author = UserService.create_user(
            UserCreate(name="Author", email="author@example.com", password="password123")
        )
        bug = BugService.create_bug(
            BugCreate(
                project_id=project.id,
                title="Broken login",
                description="Login fails",
                priority="high",
            )
        )

        comment = CommentService.create_comment(bug.id, author.id, "Investigating")
        assert comment.bug_id == bug.id
        assert CommentService.get_comment_by_id(comment.id).id == comment.id
        assert [item.id for item in CommentService.list_comments(bug.id)] == [comment.id]
        assert CommentService.delete_comment(comment.id) is True
        assert CommentService.get_comment_by_id(comment.id) is None

        try:
            CommentService.create_comment(9999, author.id, "Missing bug")
        except ValueError as exc:
            assert str(exc) == "Bug 9999 not found"
        else:
            raise AssertionError("Expected missing bug comment to fail")

        try:
            CommentService.create_comment(bug.id, 9999, "Missing author")
        except ValueError as exc:
            assert str(exc) == "User 9999 not found"
        else:
            raise AssertionError("Expected missing author comment to fail")

        try:
            CommentService.delete_comment(9999)
        except ValueError as exc:
            assert str(exc) == "Comment 9999 not found"
        else:
            raise AssertionError("Expected missing comment delete to fail")


def test_member_role_bug_permissions(app) -> None:
    with app.app_context():
        project = ProjectService.create_project(ProjectCreate(name="Core", description="Core project"))
        assignee = UserService.create_user(
            UserCreate(name="Assignee", email="assignee@example.com", password="password123")
        )

        bug = BugService.create_bug(
            BugCreate(
                project_id=project.id,
                title="Member bug",
                description="Needs work",
                priority="high",
            )
        )

        try:
            BugService.transition_bug(bug.id, BugStatus.IN_PROGRESS.value, actor_role="member")
        except ValueError as exc:
            assert str(exc) == "Members can only resolve in_progress bugs"
        else:
            raise AssertionError("Expected member open->in_progress to fail")

        BugService.update_bug(
            bug.id,
            BugUpdate(assignee_id=assignee.id),
            actor_role="admin",
        )
        BugService.transition_bug(bug.id, BugStatus.IN_PROGRESS.value, actor_role="admin")

        try:
            BugService.transition_bug(bug.id, BugStatus.RESOLVED.value, actor_role="member")
        except StateMachineError as exc:
            assert str(exc) == "Resolution note required before transitioning to resolved"
        else:
            raise AssertionError("Expected member resolve without note to fail")

        resolved = BugService.update_bug(
            bug.id,
            BugUpdate(resolution_note="Member fix"),
            actor_role="member",
        )
        assert resolved.resolution_note == "Member fix"

        resolved = BugService.transition_bug(
            bug.id,
            BugStatus.RESOLVED.value,
            actor_role="member",
        )
        assert resolved.status == BugStatus.RESOLVED.value

        try:
            BugService.transition_bug(bug.id, BugStatus.CLOSED.value, actor_role="member")
        except ValueError as exc:
            assert str(exc) == "Members can only resolve in_progress bugs"
        else:
            raise AssertionError("Expected member resolved->closed to fail")
