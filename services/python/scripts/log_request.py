from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import json
import logging
from datetime import datetime
from starlette.responses import Response

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Get request body
        request_body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                request_body = await request.json()
            except:
                request_body = await request.body()

        # Get response
        response = await call_next(request)
        
        # Calculate duration
        duration = round((time.time() - start_time) * 1000, 2)  # in ms

        # Get response body
        response_body = None
        try:
            response_body = await response.body()
            response_body = json.loads(response_body)
        except:
            response_body = response_body

        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "method": request.method,
            "url": str(request.url),
            "query": dict(request.query_params),
            "params": request.path_params,
            "requestBody": request_body,
            "responseBody": response_body,
            "statusCode": response.status_code,
            "responseTime": f"{duration}ms",
        }

        logging.info(json.dumps(log_entry))

        return response

def logger_middleware(app):
    app.add_middleware(LoggingMiddleware)
