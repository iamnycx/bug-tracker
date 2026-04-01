from flask import Blueprint, jsonify

main_bp = Blueprint("main", __name__)

@main_bp.get("/")
def index():
    return jsonify({"status": "ok"})


def register_blueprints(app):
    """Register all route blueprints."""
    from .users import users_bp
    from .projects import projects_bp
    from .bugs import bugs_bp
    
    app.register_blueprint(users_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(bugs_bp)
