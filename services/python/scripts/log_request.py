from flask import request, g
import time
import json
import logging
from datetime import datetime

def logger_middleware(app):
    @app.before_request
    def start_timer():
        g.start_time = time.time()

    @app.after_request
    def log_response(response):
        if not hasattr(g, 'start_time'):
            g.start_time = time.time()

        duration = round((time.time() - g.start_time) * 1000, 2)  # u ms

        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "method": request.method,
            "url": request.url,
            "query": request.args.to_dict(),
            "params": request.view_args if request.view_args else {},
            "requestBody": try_parse_json(request.get_data(as_text=True)),
            "responseBody": try_parse_json(response.get_data(as_text=True)),
            "statusCode": response.status_code,
            "responseTime": f"{duration}ms",
        }

        logging.info(json.dumps(log_entry))

        return response

def try_parse_json(data):
    try:
        return json.loads(data)
    except Exception:
        return data
