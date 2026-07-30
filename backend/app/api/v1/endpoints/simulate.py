from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SimulateRequest(BaseModel):
    scenario: str
    target_meter_id: str

@router.post('')
async def simulate_theft(payload: SimulateRequest):
    return {
        'success': True,
        'message': f'Simulation {payload.scenario} triggered on {payload.target_meter_id}',
        'data': {
            'scenario': payload.scenario,
            'target_meter_id': payload.target_meter_id,
            'new_risk_score': 0.96
        }
    }
