from enum import Enum
from typing import Optional


class BugStatus(str, Enum):
    """Bug lifecycle states."""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


# Define valid transition paths: state -> list of allowed next states
VALID_TRANSITIONS = {
    BugStatus.OPEN: [BugStatus.IN_PROGRESS],
    BugStatus.IN_PROGRESS: [BugStatus.RESOLVED],
    BugStatus.RESOLVED: [BugStatus.CLOSED],
    BugStatus.CLOSED: [],
}


class StateMachineError(ValueError):
    """Raised when an invalid state transition is attempted."""
    pass


def can_transition(
    current_status: BugStatus,
    next_status: BugStatus,
    assignee_id: Optional[int] = None,
    resolution_note: Optional[str] = None,
) -> tuple[bool, Optional[str]]:
    """
    Validate if a state transition is allowed.
    
    Returns:
        (is_allowed, error_message)
    """
    # Check if transition exists in valid transitions
    if next_status not in VALID_TRANSITIONS.get(current_status, []):
        return False, f"Cannot transition from {current_status.value} to {next_status.value}"
    
    # Guard: assignee required before in_progress
    if next_status == BugStatus.IN_PROGRESS and not assignee_id:
        return False, "Assignee required before transitioning to in_progress"
    
    # Guard: resolution_note required before resolved
    if next_status == BugStatus.RESOLVED and not resolution_note:
        return False, "Resolution note required before transitioning to resolved"
    
    return True, None


def transition_state(
    current_status: BugStatus,
    next_status: BugStatus,
    assignee_id: Optional[int] = None,
    resolution_note: Optional[str] = None,
) -> BugStatus:
    """
    Transition a bug to a new state, enforcing guards.
    
    Raises:
        StateMachineError: if the transition is invalid
    """
    is_allowed, error_msg = can_transition(
        current_status,
        next_status,
        assignee_id=assignee_id,
        resolution_note=resolution_note,
    )
    
    if not is_allowed:
        raise StateMachineError(error_msg)
    
    return next_status
