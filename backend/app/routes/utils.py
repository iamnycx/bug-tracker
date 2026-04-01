from flask import jsonify
from typing import Any, Optional


def api_response(
    data: Any = None,
    error: Optional[str] = None,
    status_code: int = 200,
):
    """
    Return a standardized API response.
    
    Args:
        data: Response data (on success)
        error: Error message (on error)
        status_code: HTTP status code
    """
    response = {
        "data": data,
        "error": error,
        "status": status_code,
    }
    return jsonify(response), status_code
