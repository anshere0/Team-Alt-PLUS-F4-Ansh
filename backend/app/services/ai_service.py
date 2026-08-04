import json
import logging

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services import alert_service, dashboard_service

logger = logging.getLogger(__name__)

client = None
if settings.OPENAI_API_KEY:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_dashboard_summary",
            "description": "Get the high-level summary of the power grid, including total load, active critical alerts, and system health index.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_active_alerts",
            "description": "Retrieve the current active un-resolved alerts in the grid.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]

async def process_chat(message: str, db: AsyncSession) -> str:
    if not client:
        return "AI integration is not configured. Please add OPENAI_API_KEY to your environment variables."
        
    messages = [
        {"role": "system", "content": "You are the GridGuard AI Copilot. You assist power grid operators by answering questions about the current state of the electrical grid, including substations, transformers, and alerts."},
        {"role": "user", "content": message}
    ]
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )
        
        response_message = response.choices[0].message
        
        # Check if model wants to call a function
        if response_message.tool_calls:
            messages.append(response_message)
            
            for tool_call in response_message.tool_calls:
                function_name = tool_call.function.name
                
                # Execute internal tool
                if function_name == "get_dashboard_summary":
                    summary = await dashboard_service.get_dashboard_summary(db)
                    function_response = summary.model_dump_json()
                elif function_name == "get_active_alerts":
                    alerts = await alert_service.get_active_alerts(db, limit=10)
                    function_response = json.dumps([
                        {"equipment": a["meter_id"], "severity": a["severity"], "message": a["message"]} 
                        for a in alerts
                    ])
                else:
                    function_response = json.dumps({"error": "Unknown function"})
                
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": function_response,
                })
                
            # Second call to OpenAI with the tool results
            second_response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
            )
            return second_response.choices[0].message.content
            
        else:
            return response_message.content
            
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        return f"Error communicating with AI: {e!s}"
