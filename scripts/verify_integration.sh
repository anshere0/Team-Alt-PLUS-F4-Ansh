#!/bin/bash

echo "=== GRIDGUARD INTEGRATION CHECK ==="

echo "[1/4] Checking PostgreSQL DB..."
docker compose exec -T postgres pg_isready -U postgres || exit 1

echo "[2/4] Checking Backend Health..."
curl -f http://localhost:5000/health || exit 1

echo "[3/4] Checking AI Engine Health..."
curl -f http://localhost:8000/health || exit 1

echo "[4/4] Checking Frontend Health..."
curl -f http://localhost:3000/health || exit 1

echo "SUCCESS: ALL DOMAINS INTEGRATED AND READY!"
