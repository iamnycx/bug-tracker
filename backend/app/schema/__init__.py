from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from ..core.state_machine import BugStatus


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class UserCreate(UserBase):
    model_config = ConfigDict(extra="forbid")

    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="member", pattern="^(admin|member)$")


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    is_blocked: bool
    created_at: datetime
    updated_at: datetime


class UserAdminRead(UserRead):
    credential_password: Optional[str] = None


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    model_config = ConfigDict(extra="forbid")


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class CommentBase(BaseModel):
    text: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    pass


class CommentCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(..., min_length=1)


class CommentRead(CommentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bug_id: int
    author_id: int
    created_at: datetime
    updated_at: datetime


class BugBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")


class BugCreate(BugBase):
    model_config = ConfigDict(extra="forbid")

    project_id: int


class BugUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|critical)$")
    assignee_id: Optional[int] = None
    resolution_note: Optional[str] = None


class BugListQuery(BaseModel):
    """Validated query parameters for GET /bugs."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    project_id: Optional[int] = None
    status: Optional[BugStatus] = None
    priority: Optional[Literal["low", "medium", "high", "critical"]] = None
    assignee_id: Optional[int] = None


class BugTransition(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: BugStatus


class BugRead(BugBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    status: str
    assignee_id: Optional[int] = None
    resolution_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class BugReadWithRelations(BugRead):
    assignee: Optional[UserRead] = None
    comments: list[CommentRead] = Field(default_factory=list)


class AuthLoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(..., pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    password: str = Field(..., min_length=1)


class AuthTokenRead(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserRead
