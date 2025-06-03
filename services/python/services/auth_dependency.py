from fastapi import Depends, Request
from services.auth_service import AuthService
from typing import Dict, Any

auth_service = AuthService()

async def get_current_user(request: Request) -> Dict[str, Any]:
    """
    Dependency that can be used in FastAPI routes to require authentication
    """
    return await auth_service.verify_token(request) 