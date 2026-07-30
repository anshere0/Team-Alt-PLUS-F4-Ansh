Write-Host "Starting GridGuard AI Locally (Manual Mode)"

Write-Host "WARNING: Ensure PostgreSQL and Redis are running locally or your .env URLs point to a cloud database!"

Write-Host "Starting AI Service on port 8001..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai; uvicorn api.main:app --host 0.0.0.0 --port 8001"

Start-Sleep -Seconds 3

Write-Host "Starting Backend on port 8000..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; uvicorn app.main:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "All services started in separate windows."
