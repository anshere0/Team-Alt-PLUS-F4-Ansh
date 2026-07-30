from pydantic import BaseModel, ConfigDict
from app.db.models.user import Role

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: Role
    
    model_config = ConfigDict(from_attributes=True)

class AuthSession(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
