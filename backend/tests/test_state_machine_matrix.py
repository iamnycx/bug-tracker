import re

import pytest

from app.core.state_machine import BugStatus, StateMachineError, can_transition, transition_state


@pytest.mark.parametrize(
    ("current_status", "next_status", "assignee_id", "resolution_note", "allowed", "message"),
    [
        (BugStatus.OPEN, BugStatus.OPEN, None, None, False, "Cannot transition from open to open"),
        (BugStatus.OPEN, BugStatus.OPEN, 7, None, False, "Cannot transition from open to open"),
        (BugStatus.OPEN, BugStatus.IN_PROGRESS, None, None, False, "Assignee required before transitioning to in_progress"),
        (BugStatus.OPEN, BugStatus.IN_PROGRESS, 7, None, True, None),
        (BugStatus.OPEN, BugStatus.RESOLVED, 7, "Done", False, "Cannot transition from open to resolved"),
        (BugStatus.OPEN, BugStatus.CLOSED, 7, "Done", False, "Cannot transition from open to closed"),
        (BugStatus.IN_PROGRESS, BugStatus.OPEN, 7, "Working", False, "Cannot transition from in_progress to open"),
        (BugStatus.IN_PROGRESS, BugStatus.IN_PROGRESS, 7, "Working", False, "Cannot transition from in_progress to in_progress"),
        (BugStatus.IN_PROGRESS, BugStatus.RESOLVED, 7, None, False, "Resolution note required before transitioning to resolved"),
        (BugStatus.IN_PROGRESS, BugStatus.RESOLVED, 7, "Done", True, None),
        (BugStatus.IN_PROGRESS, BugStatus.CLOSED, 7, "Done", False, "Cannot transition from in_progress to closed"),
        (BugStatus.RESOLVED, BugStatus.OPEN, 7, "Done", False, "Cannot transition from resolved to open"),
        (BugStatus.RESOLVED, BugStatus.IN_PROGRESS, 7, "Done", False, "Cannot transition from resolved to in_progress"),
        (BugStatus.RESOLVED, BugStatus.RESOLVED, 7, "Done", False, "Cannot transition from resolved to resolved"),
        (BugStatus.RESOLVED, BugStatus.CLOSED, 7, "Done", True, None),
        (BugStatus.CLOSED, BugStatus.OPEN, 7, "Done", False, "Cannot transition from closed to open"),
        (BugStatus.CLOSED, BugStatus.IN_PROGRESS, 7, "Done", False, "Cannot transition from closed to in_progress"),
        (BugStatus.CLOSED, BugStatus.RESOLVED, 7, "Done", False, "Cannot transition from closed to resolved"),
        (BugStatus.CLOSED, BugStatus.CLOSED, 7, "Done", False, "Cannot transition from closed to closed"),
    ],
)
def test_transition_matrix(
    current_status: BugStatus,
    next_status: BugStatus,
    assignee_id: int | None,
    resolution_note: str | None,
    allowed: bool,
    message: str | None,
) -> None:
    result, error = can_transition(
        current_status,
        next_status,
        assignee_id=assignee_id,
        resolution_note=resolution_note,
    )

    assert result is allowed
    assert error == message

    if allowed:
        assert (
            transition_state(
                current_status,
                next_status,
                assignee_id=assignee_id,
                resolution_note=resolution_note,
            )
            is next_status
        )
    else:
        with pytest.raises(StateMachineError, match=re.escape(message or "")):
            transition_state(
                current_status,
                next_status,
                assignee_id=assignee_id,
                resolution_note=resolution_note,
            )


def test_bug_status_order_is_stable() -> None:
    assert [status.value for status in BugStatus] == [
        "open",
        "in_progress",
        "resolved",
        "closed",
    ]
