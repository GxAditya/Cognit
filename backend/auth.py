from fastapi import HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from database import get_session_by_token

security = HTTPBearer()


async def get_current_user(authorization: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Dependency to verify the session token and return the user_id.
    
    Reads the Bearer token from the Authorization header,
    queries the PostgreSQL session table, and validates:
    - Token exists in the session table
    - Session has not expired (expires_at > NOW())
    
    Args:
        authorization: The HTTP Authorization credentials containing the Bearer token
        
    Returns:
        str: The user_id associated with the valid session
        
    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    if not authorization or not authorization.credentials:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.credentials
    
    # Query the session table for valid session
    session = get_session_by_token(token)
    
    if not session:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Return the userId from the session (camelCase column name)
    user_id = session.get("userId")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Session does not have an associated user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id