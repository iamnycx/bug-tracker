from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from pydantic import ValidationError

from ..schema import AuthLoginRequest, AuthTokenRead, UserRead
from ..services import AuthService
from .utils import api_response, log_unexpected_error


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/login")
def login():
    try:
        data = AuthLoginRequest(**(request.get_json() or {}))
    except ValidationError as exc:
        return api_response(error=str(exc), status_code=400)

    try:
        token, user = AuthService.login(data)
        payload = AuthTokenRead(
            access_token=token,
            user=UserRead.model_validate(user),
        )
        return api_response(data=payload.model_dump(), status_code=200)
    except ValueError as exc:
        return api_response(error=str(exc), status_code=401)
    except Exception:
        log_unexpected_error("auth.login")
        return api_response(error="Internal server error", status_code=500)


@auth_bp.get("/me")
@jwt_required()
def me():
    try:
        identity = get_jwt_identity()
        user = AuthService.get_user_by_identity(str(identity))
        return api_response(
            data=UserRead.model_validate(user).model_dump(),
            status_code=200,
        )
    except ValueError as exc:
        return api_response(error=str(exc), status_code=401)
    except Exception:
        log_unexpected_error("auth.me")
        return api_response(error="Internal server error", status_code=500)
