from app.core.state_machine import BugStatus, StateMachineError, can_transition, transition_state


def test_can_transition_accepts_all_valid_edges() -> None:
    assert can_transition(BugStatus.OPEN, BugStatus.IN_PROGRESS, assignee_id=1) == (True, None)
    assert can_transition(
        BugStatus.IN_PROGRESS,
        BugStatus.RESOLVED,
        assignee_id=1,
        resolution_note="Done",
    ) == (True, None)
    assert can_transition(BugStatus.RESOLVED, BugStatus.CLOSED) == (True, None)


def test_can_transition_rejects_missing_assignee() -> None:
    allowed, message = can_transition(BugStatus.OPEN, BugStatus.IN_PROGRESS)
    assert allowed is False
    assert message == "Assignee required before transitioning to in_progress"


def test_can_transition_rejects_missing_resolution_note() -> None:
    allowed, message = can_transition(BugStatus.IN_PROGRESS, BugStatus.RESOLVED, assignee_id=7)
    assert allowed is False
    assert message == "Resolution note required before transitioning to resolved"


def test_can_transition_rejects_skipping_states() -> None:
    allowed, message = can_transition(BugStatus.OPEN, BugStatus.RESOLVED, assignee_id=7)
    assert allowed is False
    assert message == "Cannot transition from open to resolved"


def test_transition_state_returns_next_status() -> None:
    assert transition_state(BugStatus.RESOLVED, BugStatus.CLOSED) is BugStatus.CLOSED


def test_transition_state_raises_for_invalid_edge() -> None:
    try:
        transition_state(BugStatus.CLOSED, BugStatus.OPEN)
    except StateMachineError as exc:
        assert str(exc) == "Cannot transition from closed to open"
    else:
        raise AssertionError("Expected StateMachineError")
