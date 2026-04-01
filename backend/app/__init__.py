from flask import Flask
from .extensions import db, migrate
from .config import settings

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.DATABASE_URL
    app.config["DEBUG"] = settings.DEBUG

    db.init_app(app)
    migrate.init_app(app, db)

    # Import models so they're registered with SQLAlchemy
    from . import models  # noqa: F401

    from .routes import main_bp, register_blueprints
    app.register_blueprint(main_bp)
    register_blueprints(app)

    return app
