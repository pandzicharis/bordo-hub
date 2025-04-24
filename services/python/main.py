from flask import Flask
from scripts.log_config import setup_logging 

app = Flask(__name__)

setup_logging()

@app.route('/test2')
def hello_world():
    print("Ova poruka ide u python.log")
    return 'Hello from PYTHON  server!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
