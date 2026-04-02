from functools import wraps
from typing import Any, Optional

from flask import current_app, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request
from ..services import AuthService


def log_unexpected_error(context: str) -> None:
    """Log full traceback for 500 responses (observability). Call inside except blocks."""
    current_app.logger.exception("Unexpected error in %s", context)


def api_response(
    data: Any = None,
    error: Optional[str] = None,
    status_code: int = 200,
):
    """
    Return a standardized API response.
    
    Args:
        data: Response data (on success)
        error: Error message (on error)
        status_code: HTTP status code
    """
    response = {
        "data": data,
        "error": error,
        "status": status_code,
    }
    return jsonify(response), status_code


def require_roles(*allowed_roles: str):
    """Guard route access based on JWT role claims."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                return api_response(error="Forbidden", status_code=403)

            identity = get_jwt_identity()
            try:
                AuthService.get_user_by_identity(str(identity))
            except ValueError as exc:
                error = str(exc)
                status_code = 403 if error == "User is blocked" else 401
                return api_response(error=error, status_code=status_code)

            return fn(*args, **kwargs)

        return wrapper

    return decorator
