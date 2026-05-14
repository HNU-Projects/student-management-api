#!/bin/bash

# --- Student Management System Run Script ---
echo "[*] Starting Student Management System..."

# 1. Start the Docker backend containers
echo "[+] Starting backend services (DB, Redis, API, Monitoring)..."
docker compose up -d db redis api prometheus grafana

if [ $? -ne 0 ]; then
    echo "[!] Failed to start Docker services. Please check if Docker is running."
    exit 1
fi

# 2. Setup and run the frontend locally
echo "[+] Setting up frontend..."
cd frontend || exit 1

echo "[+] Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "[!] npm install failed."
    exit 1
fi

echo "[!] System is up. Backend is in Docker, starting Frontend locally..."
echo ""
echo "Frontend:    http://localhost:3000"
echo "Backend API:  http://localhost:8000"
echo "Monitoring:  http://localhost:3001"
echo ""

# 3. Run frontend dev server
npm run dev
