import asyncio
import websockets
import json
async def test():
    token = ''
    uri = f'ws://127.0.0.1:8000/api/v1/ws/stream?token={token}'
    async with websockets.connect(uri, extra_headers={'Origin': 'http://localhost:3000'}) as ws:
        response = await ws.recv()
        print(f'Received: {response}')
asyncio.run(test())
