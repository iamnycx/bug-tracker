from flask import Blueprint, request
from pydantic import ValidationError
from ..schema import ProjectCreate, ProjectRead
from ..services import ProjectService
from .utils import api_response

projects_bp = Blueprint("projects", __name__, url_prefix="/projects")


@projects_bp.post("")
def create_project():
    """Create a new project."""
    try:
        data = ProjectCreate(**request.get_json() or {})
    except ValidationError as e:
        return api_response(error=str(e), status_code=400)
    
    try:
        project = ProjectService.create_project(data)
        return api_response(
            data=ProjectRead.model_validate(project).model_dump(),
            status_code=201,
        )
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@projects_bp.get("")
def list_projects():
    """List all projects."""
    try:
        projects = ProjectService.list_projects()
        return api_response(
            data=[ProjectRead.model_validate(p).model_dump() for p in projects],
            status_code=200,
        )
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)


@projects_bp.get("/<int:project_id>")
def get_project(project_id: int):
    """Get a project by ID."""
    try:
        project = ProjectService.get_project_by_id(project_id)
        if not project:
            return api_response(error=f"Project {project_id} not found", status_code=404)
        
        return api_response(
            data=ProjectRead.model_validate(project).model_dump(),
            status_code=200,
        )
    except Exception as e:
        return api_response(error="Internal server error", status_code=500)
