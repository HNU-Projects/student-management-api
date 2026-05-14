from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.rate_limiter import rate_limiter
from app.utils.logger import get_logger

logger = get_logger("middleware")

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware to apply exponential rate limiting to all incoming requests.
    """
    async def dispatch(self, request: Request, call_next):
        # 1. Identify the client (using IP address)
        client_ip = request.client.host if request.client else "unknown"
        
        # 2. Identify the endpoint (to allow per-endpoint limiting if needed)
        # For simplicity, we limit by the path
        endpoint = request.url.path
        
        # Skip rate limiting for specific paths if necessary (e.g., /metrics, /docs)
        if endpoint in ["/metrics", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        # 3. Check rate limit
        penalty_seconds = await rate_limiter.is_rate_limited(client_ip, endpoint)
        
        if penalty_seconds is not None:
            logger.info(f"Blocking request from {client_ip} to {endpoint} due to rate limit. Penalty: {penalty_seconds}s")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many requests. Exponential backoff applied.",
                    "retry_after_seconds": penalty_seconds,
                    "error_type": "rate_limit_exceeded"
                },
                headers={"Retry-After": str(penalty_seconds)}
            )

        # 4. Proceed to next middleware/handler
        response = await call_next(request)
        return response
