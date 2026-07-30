from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.db.models.user import User
from app.services import grid_service
from app.db.models.prediction import Prediction

router = APIRouter()

@router.get("")
async def get_topology(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    substations = await grid_service.get_all_substations(db)
    feeders = await grid_service.get_feeders(db)
    transformers = await grid_service.get_transformers(db)
    meters = await grid_service.get_smart_meters(db)

    # Get latest predictions for all meters
    # Simplest way is to just fetch the most recent prediction for each meter, or for now just 0.0 and rely on WS
    # To be robust, let's just return 0.0 for initial load since the simulation generates it actively anyway.
    
    nodes = []
    edges = []

    # Layout Parameters
    Y_SPACING = 200
    X_SPACING = 250
    
    # Track X position per level to avoid overlap
    level_counts = {
        'substation': 0,
        'feeder': 0,
        'transformer': 0,
        'meter': 0
    }

    def get_x(level_name: str, total: int):
        # Center the nodes based on total count
        idx = level_counts[level_name]
        level_counts[level_name] += 1
        start_x = - ((total - 1) * X_SPACING) / 2
        return start_x + (idx * X_SPACING)

    # 1. Substations
    for sub in substations:
        nodes.append({
            "id": sub.id,
            "type": "substation",
            "label": sub.name,
            "status": "nominal",
            "risk_score": 0.0,
            "loss_percentage": 0.0,
            "position": {"x": get_x('substation', len(substations)), "y": 0},
            "details": {
                "capacity_kva": sub.capacity_mva * 1000
            }
        })

    # 2. Feeders
    for fdr in feeders:
        nodes.append({
            "id": fdr.id,
            "type": "feeder",
            "label": fdr.code,
            "status": "nominal",
            "risk_score": 0.0,
            "loss_percentage": 0.0,
            "position": {"x": get_x('feeder', len(feeders)), "y": Y_SPACING},
            "details": {
                "current_load_kw": fdr.current_load_kw
            }
        })
        edges.append({
            "id": f"edge-{substations[0].id}-{fdr.id}",
            "source": substations[0].id,
            "target": fdr.id,
            "status": "nominal",
            "load_flow_rate": fdr.current_load_kw
        })

    # 3. Transformers
    for tr in transformers:
        nodes.append({
            "id": tr.id,
            "type": "transformer",
            "label": tr.code,
            "status": "nominal",
            "risk_score": 0.0,
            "loss_percentage": 0.0,
            "position": {"x": get_x('transformer', len(transformers)), "y": Y_SPACING * 2},
            "details": {
                "capacity_kva": tr.capacity_kva
            }
        })
        edges.append({
            "id": f"edge-{tr.feeder_id}-{tr.id}",
            "source": tr.feeder_id,
            "target": tr.id,
            "status": "nominal",
            "load_flow_rate": 0
        })

    # 4. Meters
    for mtr in meters:
        nodes.append({
            "id": mtr.id,
            "type": "meter",
            "label": mtr.meter_number,
            "status": "nominal",
            "risk_score": 0.0,
            "loss_percentage": 0.0,
            "position": {"x": get_x('meter', len(meters)), "y": Y_SPACING * 3},
            "details": {}
        })
        edges.append({
            "id": f"edge-{mtr.transformer_id}-{mtr.id}",
            "source": mtr.transformer_id,
            "target": mtr.id,
            "status": "nominal",
            "load_flow_rate": 0
        })

    return {
        "nodes": nodes,
        "edges": edges
    }
