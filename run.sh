#!/bin/bash

# --- Student Management System Run Script ---
# This script builds and starts the entire application stack using Docker Compose.

echo "[*] Starting Student Management System..."

# 1. Start the Docker containers
echo "[+] Building and starting containers (this might take a minute)..."
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo "[!] System is up and running!"
    echo ""
    echo "🔗 Access Links:"
    echo "--------------------------------------------------"
    echo "Frontend:    http://localhost:3000"
    echo "Backend API:  http://localhost:8000"
    echo "Monitoring:  http://localhost:3001 (Grafana)"
    echo "--------------------------------------------------"
    echo ""
    echo "Logs:    docker compose logs -f"
    echo "Stop:    docker compose down"
else
    echo "[!] Failed to start the system. Please check if Docker is running."
fi
