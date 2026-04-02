from typing import Optional
from ..extensions import db
from ..models import Comment, Bug, User
from ..schema import CommentCreate


class CommentService:
    """Service for comment operations."""

    @staticmethod
    def create_comment(bug_id: int, author_id: int, text: str) -> Comment:
        """Create a new comment."""
        # Verify bug exists
        bug = db.session.get(Bug, bug_id)
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")
        
        # Verify author exists
        author = db.session.get(User, author_id)
        if not author:
            raise ValueError(f"User {author_id} not found")
        
        comment = Comment(bug_id=bug_id, author_id=author_id, text=text)
        db.session.add(comment)
        db.session.commit()
        return comment

    @staticmethod
    def get_comment_by_id(comment_id: int) -> Optional[Comment]:
        """Get comment by ID."""
        return db.session.get(Comment, comment_id)

    @staticmethod
    def list_comments(bug_id: int) -> list[Comment]:
        """List all comments for a bug."""
        return Comment.query.filter_by(bug_id=bug_id).all()

    @staticmethod
    def delete_comment(comment_id: int) -> bool:
        """Delete a comment."""
        comment = db.session.get(Comment, comment_id)
        if not comment:
            raise ValueError(f"Comment {comment_id} not found")
        
        db.session.delete(comment)
        db.session.commit()
        return True
