import asyncio
import os
from dotenv import load_dotenv
load_dotenv('.env')
from app.core.database import AsyncSessionLocal
from app.db.models.user import User, Role
from app.core.security import get_password_hash
from sqlalchemy import select
async def run():
    db = AsyncSessionLocal()
    result = await db.execute(select(User).where(User.username == 'grid_operator'))
    user = result.scalars().first()
    if not user:
        print('Creating user grid_operator')
        new_user = User(username='grid_operator', email='operator@gridguard.ai', hashed_password=get_password_hash('password123'), role=Role.ADMIN)
        db.add(new_user)
        await db.commit()
    else:
        print('User grid_operator already exists, updating password')
        user.hashed_password = get_password_hash('password123')
        await db.commit()
    await db.close()
asyncio.run(run())
