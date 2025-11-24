from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.database import get_db
import os
from dotenv import load_dotenv

load_dotenv()
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT secret not configured")
    
    try:
        payload = jwt.decode(credentials.credentials, SUPABASE_JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Optional: Verify user exists in profiles
    # profile = crud.get_profile(db, user_id=user_id)
    # if profile is None:
    #     raise HTTPException(status_code=401, detail="User not found")
    
    return user_id