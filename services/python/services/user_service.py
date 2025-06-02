from sqlalchemy.orm import Session
from models.user import User
from typing import List

class UserService:
    def __init__(self, db_session: Session):
        self.db = db_session

    def create_user(self, email: str, username: str) -> User:
        user = User(email=email, username=username)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user(self, user_id: int) -> User:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> User:
        return self.db.query(User).filter(User.email == email).first()

    def get_all_users(self) -> List[User]:
        return self.db.query(User).all() 