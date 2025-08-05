from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from services.auth_dependency import get_current_user
from services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI"])

ai_service = AIService()

@router.post("/process-project")
async def process_project_documentation(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Process tyrio.txt document and extract project plan
    """
    try:
        logger.info(f"User {current_user.get('id')} requested tyrio document processing")
        
        return await ai_service.process_project_documentation()
        
    except Exception as e:
        logger.error(f"Error processing project documentation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}") 