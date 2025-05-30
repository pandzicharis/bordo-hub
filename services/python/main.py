from fastapi import FastAPI
from scripts.log_config import setup_logging 
from scripts.log_request import logger_middleware
from threading import Thread
from consumer import start_event_listener

app = FastAPI()

setup_logging()
logger_middleware(app)

Thread(target=start_event_listener, daemon=True).start()

@app.get('/hello')
async def get_hello():
    print("Hello from python!")
    return 'Hello from python!'

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
