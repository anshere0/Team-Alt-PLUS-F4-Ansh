from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: T | None = None
    code: str | None = None
    errors: list[Any] | None = None
    pagination: dict[str, Any] | None = None

def success_response(data: Any, message: str = "Operation completed successfully.") -> ApiResponse:
    return ApiResponse(success=True, message=message, data=data)

def error_response(message: str, code: str = "ERROR", errors: list[Any] | None = None) -> ApiResponse:
    return ApiResponse(success=False, message=message, code=code, errors=errors)
