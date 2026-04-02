import ast
from pathlib import Path
import re

BACKEND_ROOT = Path(__file__).resolve().parents[1]
APP_ROOT = BACKEND_ROOT / "app"


ROUTE_FILES = sorted((APP_ROOT / "routes").glob("*.py"))


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _has_print_call(path: Path) -> bool:
    tree = ast.parse(_read(path), filename=str(path))
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "print":
            return True
    return False


def test_backend_entrypoints_do_not_print() -> None:
    for path in [BACKEND_ROOT / "main.py", BACKEND_ROOT / "run.py", *APP_ROOT.glob("**/*.py")]:
        if path.name == "check_endpoints.py":
            continue
        assert not _has_print_call(path), path


def test_route_modules_stay_thin() -> None:
    model_query_pattern = re.compile(r"\b(?:Bug|Comment|Project|User)\.query\b")
    forbidden_direct_db_access = ("db.session", "session.add(", "session.delete(", "session.commit(")

    for path in ROUTE_FILES:
        text = _read(path)
        assert not model_query_pattern.search(text), path
        for forbidden in forbidden_direct_db_access:
            assert forbidden not in text, path


def test_state_transition_policy_is_centralized() -> None:
    state_machine_path = APP_ROOT / "core" / "state_machine.py"
    state_machine_text = _read(state_machine_path)

    assert "VALID_TRANSITIONS" in state_machine_text
    assert "transition_state(" in state_machine_text

    for path in APP_ROOT.glob("**/*.py"):
        text = _read(path)
        if path == state_machine_path:
            continue
        assert "VALID_TRANSITIONS" not in text, path

    for path in APP_ROOT.glob("routes/*.py"):
        assert "transition_state(" not in _read(path), path

    for path in APP_ROOT.glob("services/*.py"):
        assert "transition_state(" not in _read(path), path


def test_direct_status_mutation_is_confined_to_bug_model() -> None:
    allowed = APP_ROOT / "models" / "bug.py"

    for path in APP_ROOT.glob("**/*.py"):
        text = _read(path)
        if path == allowed:
            continue
        assert ".status =" not in text, path
