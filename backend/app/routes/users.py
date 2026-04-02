from flask import Blueprint, request
from flask_jwt_extended import get_jwt, get_jwt_identity
from pydantic import ValidationError

from ..schema import UserAdminRead, UserCreate, UserRead
from ..services import UserService
from .utils import api_response, log_unexpected_error, require_roles

users_bp = Blueprint("users", __name__, url_prefix="/users")


def _is_admin_request() -> bool:
    claims = get_jwt()
    return claims.get("role") == "admin"


def _serialize_user(user):
    if _is_admin_request():
        return UserAdminRead.model_validate(user).model_dump()
    return UserRead.model_validate(user).model_dump()


@users_bp.post("")
@require_roles("admin")
def create_user():
    """Create a new user."""
    try:
        data = UserCreate(**request.get_json() or {})
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)
    
    try:
        user = UserService.create_user(data)
        return api_response(
            data=UserAdminRead.model_validate(user).model_dump(),
            status_code=201,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception:
        log_unexpected_error("users.create_user")
        return api_response(error="Internal server error", status_code=500)


@users_bp.get("")
@require_roles("admin", "member")
def list_users():
    """List all users."""
    try:
        users = UserService.list_users()
        return api_response(
            data=[_serialize_user(u) for u in users],
            status_code=200,
        )
    except Exception:
        log_unexpected_error("users.list_users")
        return api_response(error="Internal server error", status_code=500)


@users_bp.get("/<int:user_id>")
@require_roles("admin", "member")
def get_user(user_id: int):
    """Get a user by ID."""
    try:
        user = UserService.get_user_by_id(user_id)
        if not user:
            return api_response(error=f"User {user_id} not found", status_code=404)
        
        return api_response(
            data=_serialize_user(user),
            status_code=200,
        )
    except Exception:
        log_unexpected_error("users.get_user")
        return api_response(error="Internal server error", status_code=500)


@users_bp.patch("/<int:user_id>/block")
@require_roles("admin")
def block_user(user_id: int):
    try:
        actor_identity = get_jwt_identity()
        actor_user_id = int(str(actor_identity))
        user = UserService.set_blocked(
            user_id,
            blocked=True,
            actor_user_id=actor_user_id,
        )
        return api_response(
            data=UserAdminRead.model_validate(user).model_dump(),
            status_code=200,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception:
        log_unexpected_error("users.block_user")
        return api_response(error="Internal server error", status_code=500)


@users_bp.patch("/<int:user_id>/unblock")
@require_roles("admin")
def unblock_user(user_id: int):
    try:
        actor_identity = get_jwt_identity()
        actor_user_id = int(str(actor_identity))
        user = UserService.set_blocked(
            user_id,
            blocked=False,
            actor_user_id=actor_user_id,
        )
        return api_response(
            data=UserAdminRead.model_validate(user).model_dump(),
            status_code=200,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception:
        log_unexpected_error("users.unblock_user")
        return api_response(error="Internal server error", status_code=500)
