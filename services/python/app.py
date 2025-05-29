# reloader.py
import os
import sys
import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class ReloaderHandler(FileSystemEventHandler):
    def __init__(self, fastapi_app):
        self.fastapi_app = fastapi_app

    def on_modified(self, event):
        if event.src_path.endswith(".py"):
            print(f"Detected change in {event.src_path}. Restarting server...")
            self.restart_server()

    def restart_server(self):
        self.fastapi_app.terminate()
        self.fastapi_app.wait()
        self.fastapi_app = subprocess.Popen([sys.executable, "main.py"])

def start_fastapi_app():
    return subprocess.Popen([sys.executable, "main.py"])

def start_watchdog(fastapi_app):
    event_handler = ReloaderHandler(fastapi_app)
    observer = Observer()
    observer.schedule(event_handler, path=".", recursive=True)
    observer.start()
    return observer

if __name__ == "__main__":
    fastapi_app = start_fastapi_app()
    observer = start_watchdog(fastapi_app)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        fastapi_app.terminate()
        fastapi_app.wait()
        observer.stop()
        observer.join()
