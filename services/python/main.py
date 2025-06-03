from fastapi import FastAPI, Depends
from scripts.log_config import setup_logging 
from scripts.log_request import logger_middleware
from threading import Thread
from consumer import start_event_listener
from services.redis_service import RedisService
from services.auth_dependency import get_current_user
from typing import Dict, Any

app = FastAPI()

setup_logging()
logger_middleware(app)

# Initialize Redis service
redis_service = RedisService(host='redis', port=6379, db=0)

Thread(target=start_event_listener, daemon=True).start()

@app.get('/hello')
async def get_hello(current_user: Dict[str, Any] = Depends(get_current_user)):
    response = 'Hello from python!'
  
    return {
        "user_data": current_user,
        "response": response
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
