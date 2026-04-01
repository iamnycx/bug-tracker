from flask import Blueprint, request
from pydantic import ValidationError
from ..schema import UserCreate, UserRead
from ..services import UserService
from .utils import api_response

users_bp = Blueprint("users", __name__, url_prefix="/users")


@users_bp.post("")
def create_user():
    """Create a new user."""
    try:
        data = UserCreate(**request.get_json() or {})
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)
    
    try:
        user = UserService.create_user(data)
        return api_response(
            data=UserRead.model_validate(user).model_dump(),
            status_code=201,
        )
    except ValueError as e:
        return api_response(error=str(e), status_code=400)
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@users_bp.get("")
def list_users():
    """List all users."""
    try:
        users = UserService.list_users()
        return api_response(
            data=[UserRead.model_validate(u).model_dump() for u in users],
            status_code=200,
        )
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@users_bp.get("/<int:user_id>")
def get_user(user_id: int):
    """Get a user by ID."""
    try:
        user = UserService.get_user_by_id(user_id)
        if not user:
            return api_response(error=f"User {user_id} not found", status_code=404)
        
        return api_response(
            data=UserRead.model_validate(user).model_dump(),
            status_code=200,
        )
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)
