from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token

from ..config import settings
from ..extensions import db
from ..models import User
from ..schema import AuthLoginRequest


class AuthService:
    """Authentication and authorization service."""

    @staticmethod
    def ensure_admin_user() -> User:
        admin = User.query.filter_by(email=settings.ADMIN_EMAIL).first()
        password_hash = generate_password_hash(settings.ADMIN_PASSWORD)

        if admin is None:
            admin = User(
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL,
                password_hash=password_hash,
                credential_password=settings.ADMIN_PASSWORD,
                role="admin",
                is_blocked=False,
            )
            db.session.add(admin)
        else:
            admin.name = settings.ADMIN_NAME
            admin.password_hash = password_hash
            admin.credential_password = settings.ADMIN_PASSWORD
            admin.role = "admin"
            admin.is_blocked = False

        db.session.commit()
        return admin

    @staticmethod
    def login(data: AuthLoginRequest) -> tuple[str, User]:
        user = User.query.filter_by(email=data.email).first()
        if not user or not check_password_hash(user.password_hash, data.password):
            raise ValueError("Invalid email or password")
        if user.is_blocked:
            raise ValueError("User is blocked")

        token = create_access_token(
            identity=str(user.id),
            additional_claims={"role": user.role},
        )
        return token, user

    @staticmethod
    def get_user_by_identity(identity: str) -> User:
        try:
            user_id = int(identity)
        except ValueError as exc:
            raise ValueError("Invalid token identity") from exc

        user = db.session.get(User, user_id)
        if not user:
            raise ValueError("User not found")
        if user.is_blocked:
            raise ValueError("User is blocked")
        return user
