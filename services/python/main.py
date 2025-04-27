from flask import Flask
from scripts.log_config import setup_logging 
from scripts.log_request import logger_middleware

app = Flask(__name__)

setup_logging()

logger_middleware(app)

@app.route('/hello')
def get_hello():
    print("Hello from python!")
    return 'Hello from python!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
