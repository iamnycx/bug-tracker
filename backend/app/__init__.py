from datetime import timedelta
from flask import Flask, request
from .extensions import db, migrate, jwt
from .config import settings


def _allowed_origins() -> set[str]:
    origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    return {origin for origin in origins if origin}


def create_app(config_overrides: dict | None = None):
    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.SECRET_KEY
    app.config["JWT_SECRET_KEY"] = settings.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRES_MINUTES
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.DATABASE_URL
    app.config["DEBUG"] = settings.DEBUG

    if config_overrides:
        app.config.update(config_overrides)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import models so they're registered with SQLAlchemy
    from . import models  # noqa: F401
    from .services.auth import AuthService

    from .routes import main_bp, register_blueprints
    app.register_blueprint(main_bp)
    register_blueprints(app)

    @app.before_request
    def bootstrap_admin_user():
        if app.config.get("TESTING"):
            return None

        if app.config.get("ADMIN_BOOTSTRAPPED"):
            return None

        try:
            AuthService.ensure_admin_user()
            app.config["ADMIN_BOOTSTRAPPED"] = True
        except Exception:
            app.logger.exception("Failed to bootstrap admin user")

    allowed_origins = _allowed_origins()

    @app.after_request
    def apply_cors_headers(response):
        request_origin = request.headers.get("Origin")
        if request_origin and request_origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = request_origin
            response.headers["Vary"] = "Origin"
            response.headers["Access-Control-Allow-Credentials"] = "true"

        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return response

    return app
