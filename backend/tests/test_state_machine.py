from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.state_machine import BugStatus, StateMachineError, can_transition, transition_state


def test_open_to_in_progress_requires_assignee() -> None:
	allowed, message = can_transition(BugStatus.OPEN, BugStatus.IN_PROGRESS)
	assert allowed is False
	assert message == 'Assignee required before transitioning to in_progress'


def test_open_to_in_progress_with_assignee_is_allowed() -> None:
	allowed, message = can_transition(
		BugStatus.OPEN,
		BugStatus.IN_PROGRESS,
		assignee_id=1,
	)
	assert allowed is True
	assert message is None


def test_in_progress_to_resolved_requires_resolution_note() -> None:
	allowed, message = can_transition(BugStatus.IN_PROGRESS, BugStatus.RESOLVED, assignee_id=1)
	assert allowed is False
	assert message == 'Resolution note required before transitioning to resolved'


def test_valid_transition_returns_next_status() -> None:
	assert transition_state(BugStatus.RESOLVED, BugStatus.CLOSED) == BugStatus.CLOSED


def test_invalid_transition_raises_state_machine_error() -> None:
	try:
		transition_state(BugStatus.CLOSED, BugStatus.OPEN)
	except StateMachineError as exc:
		assert str(exc) == 'Cannot transition from closed to open'
	else:
		raise AssertionError('Expected StateMachineError')
