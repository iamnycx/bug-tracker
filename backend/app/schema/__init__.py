from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommentBase(BaseModel):
    text: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    pass


class CommentCreateRequest(BaseModel):
    author_id: int
    text: str = Field(..., min_length=1)


class CommentRead(CommentBase):
    id: int
    bug_id: int
    author_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BugBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")


class BugCreate(BugBase):
    project_id: int


class BugUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")
    assignee_id: Optional[int] = None
    resolution_note: Optional[str] = None


class BugTransition(BaseModel):
    status: str = Field(..., pattern="^(open|in_progress|resolved|closed)$")


class BugRead(BugBase):
    id: int
    project_id: int
    status: str
    assignee_id: Optional[int] = None
    resolution_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BugReadWithRelations(BugRead):
    assignee: Optional[UserRead] = None
    comments: list[CommentRead] = Field(default_factory=list)
