import asyncio
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.db.models.grid import Feeder, Substation, Transformer
from app.db.models.meter import SmartMeter
from app.db.models.user import Role, User


async def seed_users(db: AsyncSession):
    # Check if admin already exists
    result = await db.execute(select(User).where(User.username == "admin"))
    if result.scalars().first():
        print("Users already seeded. Skipping.")
        return

    users = [
        User(username="admin", email="admin@gridguard.ai", hashed_password=get_password_hash("admin123"), role=Role.ADMIN),
        User(username="manager", email="manager@gridguard.ai", hashed_password=get_password_hash("manager123"), role=Role.MANAGER),
        User(username="engineer1", email="engineer1@gridguard.ai", hashed_password=get_password_hash("engineer123"), role=Role.ENGINEER),
        User(username="inspector1", email="inspector1@gridguard.ai", hashed_password=get_password_hash("inspector123"), role=Role.INSPECTOR),
        User(username="viewer1", email="viewer1@gridguard.ai", hashed_password=get_password_hash("viewer123"), role=Role.VIEWER),
    ]
    
    db.add_all(users)
    await db.commit()
    print("Users seeded successfully.")

async def seed_grid(db: AsyncSession):
    # Check if grid already exists
    result = await db.execute(select(Substation).where(Substation.code == "SUB-ALPHA"))
    if result.scalars().first():
        print("Grid already seeded. Skipping.")
        return

    # Create Substation
    sub1 = Substation(code="SUB-ALPHA", name="Alpha Substation", latitude=34.0522, longitude=-118.2437, capacity_mva=50.0)
    db.add(sub1)
    await db.commit()
    await db.refresh(sub1)
    
    # Create Feeders
    f1 = Feeder(substation_id=sub1.id, code="FDR-A1", nominal_voltage_kv=11.0, current_load_kw=1200.0)
    f2 = Feeder(substation_id=sub1.id, code="FDR-A2", nominal_voltage_kv=11.0, current_load_kw=800.0)
    db.add_all([f1, f2])
    await db.commit()
    await db.refresh(f1)
    await db.refresh(f2)
    
    # Create Transformers
    t1 = Transformer(feeder_id=f1.id, code="TX-A1-01", capacity_kva=500.0, phase_count=3, health_index=0.95)
    t2 = Transformer(feeder_id=f1.id, code="TX-A1-02", capacity_kva=250.0, phase_count=3, health_index=0.88)
    t3 = Transformer(feeder_id=f2.id, code="TX-A2-01", capacity_kva=1000.0, phase_count=3, health_index=0.92)
    db.add_all([t1, t2, t3])
    await db.commit()
    await db.refresh(t1)
    await db.refresh(t2)
    await db.refresh(t3)
    
    # Create Smart Meters
    meters = []
    for i in range(1, 6):
        meters.append(SmartMeter(transformer_id=t1.id, meter_number=f"MTR-A1-01-{i}", consumer_name=f"Consumer A1-{i}", address=f"{i} Alpha St", latitude=34.0530 + (i*0.0001), longitude=-118.2440 + (i*0.0001)))
        meters.append(SmartMeter(transformer_id=t2.id, meter_number=f"MTR-A1-02-{i}", consumer_name=f"Consumer A2-{i}", address=f"{i} Beta St", latitude=34.0535 + (i*0.0001), longitude=-118.2445 + (i*0.0001)))
        meters.append(SmartMeter(transformer_id=t3.id, meter_number=f"MTR-A2-01-{i}", consumer_name=f"Consumer B1-{i}", address=f"{i} Gamma St", latitude=34.0540 + (i*0.0001), longitude=-118.2450 + (i*0.0001)))
        
    db.add_all(meters)
    await db.commit()
    
    print("Grid infrastructure seeded successfully.")

async def main():
    async with AsyncSessionLocal() as db:
        await seed_users(db)
        await seed_grid(db)
        
if __name__ == "__main__":
    asyncio.run(main())
