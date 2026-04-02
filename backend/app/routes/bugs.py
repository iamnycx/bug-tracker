from flask import Blueprint, request
from flask_jwt_extended import get_jwt, get_jwt_identity
from pydantic import ValidationError

from ..core.state_machine import StateMachineError
from ..schema import (
    BugCreate,
    BugListQuery,
    BugRead,
    BugReadWithRelations,
    BugTransition,
    BugUpdate,
    CommentCreateRequest,
    CommentRead,
)
from ..services import AuthService
from ..services import BugService, CommentService
from .utils import api_response, log_unexpected_error, require_roles

bugs_bp = Blueprint("bugs", __name__, url_prefix="/bugs")


def _bug_list_query() -> BugListQuery:
    raw = {k: v for k, v in request.args.items() if v != ""}
    return BugListQuery.model_validate(raw)


@bugs_bp.post("")
@require_roles("admin")
def create_bug():
    """Create a new bug."""
    try:
        data = BugCreate(**request.get_json() or {})
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)

    try:
        bug = BugService.create_bug(data)
        return api_response(
            data=BugRead.model_validate(bug).model_dump(),
            status_code=201,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception:
        log_unexpected_error("bugs.create_bug")
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.get("")
@require_roles("admin", "member")
def list_bugs():
    """List bugs with optional filtering."""
    try:
        query = _bug_list_query()
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)

    try:
        bugs = BugService.list_bugs(
            project_id=query.project_id,
            status=query.status,
            priority=query.priority,
            assignee_id=query.assignee_id,
        )
        return api_response(
            data=[BugRead.model_validate(b).model_dump() for b in bugs],
            status_code=200,
        )
    except Exception:
        log_unexpected_error("bugs.list_bugs")
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.get("/<int:bug_id>")
@require_roles("admin", "member")
def get_bug(bug_id: int):
    """Get a bug by ID with related data."""
    try:
        bug = BugService.get_bug_by_id(bug_id)
        if not bug:
            return api_response(error=f"Bug {bug_id} not found", status_code=404)

        return api_response(
            data=BugReadWithRelations.model_validate(bug).model_dump(),
            status_code=200,
        )
    except Exception:
        log_unexpected_error("bugs.get_bug")
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.put("/<int:bug_id>")
@require_roles("admin", "member")
def update_bug(bug_id: int):
    """Update a bug."""
    try:
        data = BugUpdate(**request.get_json() or {})
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)

    try:
        role = str(get_jwt().get("role", "member"))
        bug = BugService.update_bug(bug_id, data, actor_role=role)
        return api_response(
            data=BugRead.model_validate(bug).model_dump(),
            status_code=200,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception:
        log_unexpected_error("bugs.update_bug")
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.post("/<int:bug_id>/transition")
@require_roles("admin", "member")
def transition_bug(bug_id: int):
    """Transition a bug to a new status."""
    try:
        data = BugTransition(**request.get_json() or {})
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)

    try:
        role = str(get_jwt().get("role", "member"))
        bug = BugService.transition_bug(bug_id, data.status, actor_role=role)
        return api_response(
            data=BugRead.model_validate(bug).model_dump(),
            status_code=200,
        )
    except StateMachineError as e:
        return api_response(error=str(e), status_code=400)
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception:
        log_unexpected_error("bugs.transition_bug")
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.post("/<int:bug_id>/comments")
@require_roles("admin", "member")
def create_comment(bug_id: int):
    """Add a comment to a bug."""
    try:
        payload = CommentCreateRequest(**(request.get_json() or {}))
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)

    try:
        identity = get_jwt_identity()
        author = AuthService.get_user_by_identity(str(identity))
        comment = CommentService.create_comment(bug_id, author.id, payload.text)
        return api_response(
            data=CommentRead.model_validate(comment).model_dump(),
            status_code=201,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception:
        log_unexpected_error("bugs.create_comment")
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.get("/<int:bug_id>/comments")
@require_roles("admin", "member")
def list_comments(bug_id: int):
    """Get all comments for a bug."""
    try:
        comments = CommentService.list_comments(bug_id)
        return api_response(
            data=[CommentRead.model_validate(c).model_dump() for c in comments],
            status_code=200,
        )
    except Exception:
        log_unexpected_error("bugs.list_comments")
        return api_response(error="Internal server error", status_code=500)
    