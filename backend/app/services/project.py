from typing import Optional
from ..extensions import db
from ..models import Project
from ..schema import ProjectCreate


class ProjectService:
    """Service for project operations."""

    @staticmethod
    def create_project(data: ProjectCreate) -> Project:
        """Create a new project."""
        project = Project(name=data.name, description=data.description)
        db.session.add(project)
        db.session.commit()
        return project

    @staticmethod
    def get_project_by_id(project_id: int) -> Optional[Project]:
        """Get project by ID."""
        return db.session.get(Project, project_id)

    @staticmethod
    def list_projects() -> list[Project]:
        """List all projects."""
        return Project.query.all()

    @staticmethod
    def update_project(project_id: int, name: Optional[str] = None, description: Optional[str] = None) -> Project:
        """Update a project."""
        project = db.session.get(Project, project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        
        if name is not None:
            project.name = name
        if description is not None:
            project.description = description
        
        db.session.commit()
        return project

    @staticmethod
    def delete_project(project_id: int) -> bool:
        """Delete a project."""
        project = db.session.get(Project, project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")
        
        db.session.delete(project)
        db.session.commit()
        return True
