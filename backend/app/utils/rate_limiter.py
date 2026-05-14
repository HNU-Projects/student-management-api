import time
from typing import Optional
from app.cache.redis_client import get_cache_backend
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger("rate_limiter")

class ExponentialRateLimiter:
    """
    Implements rate limiting with exponential penalty growth.
    
    Logic:
    - Track number of requests in a fixed window.
    - If limit exceeded:
        - Increment violation count.
        - Calculate penalty: base_penalty * (multiplier ** (violations - 1)).
        - Set a lockout key for the penalty duration.
    - If lockout key exists:
        - Block the request.
    """
    
    def __init__(self):
        self.cache = get_cache_backend()
        self.limit = settings.rate_limit_requests
        self.window = settings.rate_limit_window
        self.penalty_base = settings.rate_limit_penalty_base
        self.penalty_multiplier = settings.rate_limit_penalty_multiplier

    def _get_keys(self, identity: str, endpoint: str):
        # identity could be IP address or user ID
        base_key = f"rl:{identity}:{endpoint}"
        return {
            "request_count": f"{base_key}:count",
            "violations": f"{base_key}:violations",
            "lockout": f"{base_key}:lockout"
        }

    async def is_rate_limited(self, identity: str, endpoint: str) -> Optional[int]:
        """
        Returns the remaining lockout time in seconds if rate limited, 
        otherwise returns None.
        """
        keys = self._get_keys(identity, endpoint)
        
        # 1. Check if currently locked out
        remaining_lockout = self.cache.ttl(keys["lockout"])
        if remaining_lockout > 0:
            return remaining_lockout

        # 2. Increment request count
        count = self.cache.incr(keys["request_count"])
        if count == 1:
            # First request in this window, set expiry
            self.cache.expire(keys["request_count"], self.window)

        # 3. Check if limit exceeded
        if count > self.limit:
            # Increment violations
            violations = self.cache.incr(keys["violations"])
            # Reset violations expiry (persist for 24h of inactivity)
            self.cache.expire(keys["violations"], 86400)

            # Calculate exponential penalty
            penalty = int(self.penalty_base * (self.penalty_multiplier ** (violations - 1)))
            
            # Cap penalty at something reasonable (e.g., 1 week)
            penalty = min(penalty, 604800)
            
            # Set lockout key
            self.cache.set(keys["lockout"], str(penalty), penalty)
            
            logger.warning(
                f"Rate limit exceeded for {identity} on {endpoint}. "
                f"Violations: {violations}. Penalty: {penalty}s."
            )
            return penalty

        return None

# Singleton instance
rate_limiter = ExponentialRateLimiter()
