from typing import Optional, Dict, Any
from jose import JWTError, jwt
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from datetime import datetime, timedelta
from services.redis_service import RedisService

class AuthService:
    def __init__(self):
        self.security = HTTPBearer()
        self.redis_service = RedisService(host='redis', port=6379, db=0)
        # In production, these should be in environment variables
        self.secret_key = os.getenv("JWT_SECRET",  'secret-key')
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30

    async def verify_token(self, request: Request) -> Dict[str, Any]:
        """
        Verify JWT token and return user data
        """
        try:
            # Get the token from the Authorization header
            auth: HTTPAuthorizationCredentials = await self.security(request)
            token = auth.credentials

            # Decode and verify the token
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Check if user is active in Redis
            redis_active = self.redis_service.get(f"user:{user_id}")

            # Default to True if no Redis data found
            is_active = True
            
            if redis_active is not None:
                print("User active status in Redis", redis_active)
                is_active = redis_active
                                            
                print(f'User active status: {is_active}')

            if not is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Inactive user",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            return payload

        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
                headers={"WWW-Authenticate": "Bearer"},
            )

