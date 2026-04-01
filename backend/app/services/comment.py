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
        bug = Bug.query.get(bug_id)
        if not bug:
            raise ValueError(f"Bug {bug_id} not found")
        
        # Verify author exists
        author = User.query.get(author_id)
        if not author:
            raise ValueError(f"User {author_id} not found")
        
        comment = Comment(bug_id=bug_id, author_id=author_id, text=text)
        db.session.add(comment)
        db.session.commit()
        return comment

    @staticmethod
    def get_comment_by_id(comment_id: int) -> Optional[Comment]:
        """Get comment by ID."""
        return Comment.query.get(comment_id)

    @staticmethod
    def list_comments(bug_id: int) -> list[Comment]:
        """List all comments for a bug."""
        return Comment.query.filter_by(bug_id=bug_id).all()

    @staticmethod
    def delete_comment(comment_id: int) -> bool:
        """Delete a comment."""
        comment = Comment.query.get(comment_id)
        if not comment:
            raise ValueError(f"Comment {comment_id} not found")
        
        db.session.delete(comment)
        db.session.commit()
        return True
