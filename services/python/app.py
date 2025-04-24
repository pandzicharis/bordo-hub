# reloader.py
import os
import sys
import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class ReloaderHandler(FileSystemEventHandler):
    def __init__(self, flask_app):
        self.flask_app = flask_app

    def on_modified(self, event):
        if event.src_path.endswith(".py"):
            print(f"Detected change in {event.src_path}. Restarting server...")
            self.restart_server()

    def restart_server(self):
        self.flask_app.terminate()
        self.flask_app.wait()
        self.flask_app = subprocess.Popen([sys.executable, "main.py"])

def start_flask_app():
    return subprocess.Popen([sys.executable, "main.py"])

def start_watchdog(flask_app):
    event_handler = ReloaderHandler(flask_app)
    observer = Observer()
    observer.schedule(event_handler, path=".", recursive=True)
    observer.start()
    return observer

if __name__ == "__main__":
    flask_app = start_flask_app()
    observer = start_watchdog(flask_app)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        flask_app.terminate()
        flask_app.wait()
        observer.stop()
        observer.join()
