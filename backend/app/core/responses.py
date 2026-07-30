from typing import Any, Optional, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    code: Optional[str] = None
    errors: Optional[list[Any]] = None
    pagination: Optional[dict[str, Any]] = None

def success_response(data: Any, message: str = "Operation completed successfully.") -> ApiResponse:
    return ApiResponse(success=True, message=message, data=data)

def error_response(message: str, code: str = "ERROR", errors: Optional[list[Any]] = None) -> ApiResponse:
    return ApiResponse(success=False, message=message, code=code, errors=errors)
