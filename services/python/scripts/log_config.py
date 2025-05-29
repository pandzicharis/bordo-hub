import logging
import os
import sys
from pythonjsonlogger import jsonlogger

class PrintToLog:
    def write(self, message):
        if message.strip(): 
            logging.info(message.strip()) 
    def flush(self):
        pass
    def isatty(self):
        return False

def setup_logging():
    log_dir = "/usr/src/app/logs"  

    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Create handlers
    file_handler = logging.FileHandler(f"{log_dir}/python.log")
    file_handler.setFormatter(formatter)
    
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add our handlers
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # Redirect stdout and stderr
    sys.stdout = PrintToLog()
    sys.stderr = PrintToLog()
