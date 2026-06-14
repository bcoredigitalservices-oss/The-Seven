import time
import asyncio
from functools import wraps
from fastapi import HTTPException

# Global registry of rate limits: key -> list of timestamps
_LIMITS = {}

def rate_limit(key: str, max_requests: int, period_seconds: float):
    """
    A simple memory-based rate limiter decorator.
    key: unique key for grouping rate limit limits
    max_requests: maximum requests allowed within period_seconds
    period_seconds: window size in seconds
    """
    def decorator(func):
        if asyncio.iscoroutinefunction(func):
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                now = time.time()
                if key not in _LIMITS:
                    _LIMITS[key] = []
                
                # Filter timestamps to keep only those within the current window
                _LIMITS[key] = [t for t in _LIMITS[key] if now - t < period_seconds]
                
                if len(_LIMITS[key]) >= max_requests:
                    wait_time = period_seconds - (now - _LIMITS[key][0])
                    raise HTTPException(
                        status_code=429,
                        detail=f"Rate limit exceeded for {key}. Please try again in {wait_time:.1f} seconds."
                    )
                
                _LIMITS[key].append(now)
                return await func(*args, **kwargs)
            return async_wrapper
        else:
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                now = time.time()
                if key not in _LIMITS:
                    _LIMITS[key] = []
                
                _LIMITS[key] = [t for t in _LIMITS[key] if now - t < period_seconds]
                
                if len(_LIMITS[key]) >= max_requests:
                    wait_time = period_seconds - (now - _LIMITS[key][0])
                    raise HTTPException(
                        status_code=429,
                        detail=f"Rate limit exceeded for {key}. Please try again in {wait_time:.1f} seconds."
                    )
                
                _LIMITS[key].append(now)
                return func(*args, **kwargs)
            return sync_wrapper
    return decorator
