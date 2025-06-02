from setuptools import setup, find_packages

setup(
    name="microservices",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "python-json-logger",
        "watchdog",
        "pika",
        "sqlalchemy",
        "alembic",
        "psycopg2-binary",
        "python-dotenv"
    ],
) 