# === Security — OAuth2 Scheme Setup ===
# This file defines the authentication scheme used by the entire application.
# We use OAuth2 with Bearer Tokens — meaning every protected request must include
# a token in the Authorization header like: "Bearer eyJhbGciOi..."

from fastapi.security import OAuth2PasswordBearer

# oauth2_scheme tells FastAPI:
# - The login endpoint is at "/auth/login" (where users get their token)
# - Any endpoint that depends on this scheme will automatically extract
#   the Bearer token from the request's Authorization header.
# - If no token is provided, FastAPI returns a 401 Unauthorized response.
#
# Used as: token: str = Depends(oauth2_scheme) in route dependencies.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
