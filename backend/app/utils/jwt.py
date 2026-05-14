from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt  # jose: library for encoding/decoding JWTs

from app.core.config import settings  # holds secret_key, algorithm, expiry duration


def create_access_token(
    data: dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()  # copy to avoid mutating the original dict

    # calculate expiry time — use provided delta or fall back to settings default
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})  # "exp" is a standard JWT claim for expiry

    # sign the payload with the secret key and return the encoded token string
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def verify_access_token(token: str) -> dict[str, Any]:
    try:
        # decode and verify signature + expiry in one step
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError as exc:
        # wrap JWTError so callers don't need to import jose
        raise ValueError("Could not validate credentials") from exc
