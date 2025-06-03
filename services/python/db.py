from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

db_user = os.environ.get("PYTHON_DB_USER")
db_pass = os.environ.get("PYTHON_DB_PASSWORD")
db_port = os.environ.get("PYTHON_DB_PORT")
db_name = os.environ.get("PYTHON_DB_NAME")

DATABASE_URL = f"postgresql://{db_user}:{db_pass}@host.docker.internal:{db_port}/{db_name}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
