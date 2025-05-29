from fastapi import FastAPI
from scripts.log_config import setup_logging 
from scripts.log_request import logger_middleware

app = FastAPI()

setup_logging()

logger_middleware(app)

@app.get('/hello')
async def get_hello():
    print("Hello from python!")
    return 'Hello from python!'

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
