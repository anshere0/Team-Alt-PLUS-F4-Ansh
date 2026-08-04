import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Process the request
        response = await call_next(request)
        
        process_time = time.time() - start_time
        formatted_process_time = f"{process_time * 1000:.2f}ms"
        
        logger.info(
            f"{request.client.host if request.client else 'unknown'} - "
            f"\"{request.method} {request.url.path} HTTP/{request.scope.get('http_version', '1.1')}\" "
            f"{response.status_code} - {formatted_process_time}"
        )
        
        # Optional: Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        return response
