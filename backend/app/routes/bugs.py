from flask import Blueprint, request
from pydantic import ValidationError
from ..schema import (
    BugCreate,
    BugUpdate,
    BugRead,
    BugReadWithRelations,
    BugTransition,
    CommentCreateRequest,
    CommentRead,
)
from ..services import BugService, CommentService
from ..core.state_machine import StateMachineError
from .utils import api_response

bugs_bp = Blueprint("bugs", __name__, url_prefix="/bugs")


@bugs_bp.post("")
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
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.get("")
def list_bugs():
    """List bugs with optional filtering."""
    try:
        project_id = request.args.get("project_id", type=int)
        status = request.args.get("status")
        priority = request.args.get("priority")
        assignee_id = request.args.get("assignee_id", type=int)
        
        bugs = BugService.list_bugs(
            project_id=project_id,
            status=status,
            priority=priority,
            assignee_id=assignee_id,
        )
        return api_response(
            data=[BugRead.model_validate(b).model_dump() for b in bugs],
            status_code=200,
        )
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.get("/<int:bug_id>")
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
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.put("/<int:bug_id>")
def update_bug(bug_id: int):
    """Update a bug."""
    try:
        data = BugUpdate(**request.get_json() or {})
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)
    
    try:
        bug = BugService.update_bug(bug_id, data)
        return api_response(
            data=BugRead.model_validate(bug).model_dump(),
            status_code=200,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.post("/<int:bug_id>/transition")
def transition_bug(bug_id: int):
    """Transition a bug to a new status."""
    try:
        data = BugTransition(**request.get_json() or {})
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)
    
    try:
        bug = BugService.transition_bug(bug_id, data.status)
        return api_response(
            data=BugRead.model_validate(bug).model_dump(),
            status_code=200,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except StateMachineError as e:
        return api_response(error=str(e), status_code=400)
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.post("/<int:bug_id>/comments")
def create_comment(bug_id: int):
    """Add a comment to a bug."""
    try:
        payload = CommentCreateRequest(**(request.get_json() or {}))
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)
    
    try:
        comment = CommentService.create_comment(bug_id, payload.author_id, payload.text)
        return api_response(
            data=CommentRead.model_validate(comment).model_dump(),
            status_code=201,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@bugs_bp.get("/<int:bug_id>/comments")
def list_comments(bug_id: int):
    """Get all comments for a bug."""
    try:
        comments = CommentService.list_comments(bug_id)
        return api_response(
            data=[CommentRead.model_validate(c).model_dump() for c in comments],
            status_code=200,
        )
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)
