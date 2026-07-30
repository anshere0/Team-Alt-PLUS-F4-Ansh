#!/bin/bash
echo "Starting GridGuard AI Locally (Manual Mode)"
echo "WARNING: Ensure PostgreSQL and Redis are running locally or your .env URLs point to a cloud database!"

echo "Starting AI Service on port 8001..."
cd ai
uvicorn api.main:app --host 0.0.0.0 --port 8001 &
AI_PID=$!
cd ..

sleep 3

echo "Starting Backend on port 8000..."
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "All services started in background."
echo "To stop them, run: kill $AI_PID $BACKEND_PID $FRONTEND_PID"
