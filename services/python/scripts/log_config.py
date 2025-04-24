import logging
import os
import sys

class PrintToLog:
    def write(self, message):
        if message.strip(): 
            logging.info(message.strip()) 
    def flush(self):
        pass

def setup_logging():
    log_dir = "/usr/src/app/logs"  

    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    logging.basicConfig(
        level=logging.INFO,  
        format="%(asctime)s [%(levelname)s] %(message)s", 
        handlers=[
            logging.FileHandler(f"{log_dir}/python.log"),  
            logging.StreamHandler()  
        ]
    )

    sys.stdout = PrintToLog()
    sys.stderr = PrintToLog()
