#!/usr/bin/env bash
set -e

SOURCE_DIR="/storage/emulated/0/Alarms/DataCore/DataCore"
REPO_DIR="/data/data/com.termux/files/home/Data-Concurrency-RealTime-Transaction-Engine"
VENV_DIR="/data/data/com.termux/files/home/venv"

echo "=================================================="
echo " Starting DataCore Enterprise Preview in Termux"
echo "=================================================="

# 0. Sync latest changes from Android storage if available
if [ -d "$SOURCE_DIR" ]; then
    echo "[0/3] Syncing latest changes from $SOURCE_DIR..."
    rsync -au --exclude=".git" --exclude="node_modules" --exclude="venv" --exclude="__pycache__" "$SOURCE_DIR/" "$REPO_DIR/" 2>/dev/null || true
fi

# 1. Activate Python virtual environment & migrate/seed
source "$VENV_DIR/bin/activate"
cd "$REPO_DIR/backend"

echo "[1/3] Ensuring backend database is migrated & seeded..."
python manage.py migrate --noinput
python manage.py setup_datacore

# 2. Launch Django API server in background
echo "[2/3] Launching Django DRF backend on http://0.0.0.0:8000..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Function to kill both on exit
cleanup() {
    echo ""
    echo "Stopping DataCore preview services..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Launch Vite Frontend Dev Server
cd "$REPO_DIR/admin-dashboard"
echo "[3/3] Launching Vite Frontend on http://localhost:5173..."
echo ""
echo "Open in your Android browser: http://localhost:5173"
echo "Login Credentials:"
echo "  Email:    admin@datacore.io"
echo "  Password: AdminPassword123!"
echo ""
echo "Customer Demo Accounts (Password: Password123!):"
echo "  Alice:    alice@datacore.io   (UPI: alice@dc)"
echo "  Bob:      bob@datacore.io     (UPI: bob@dc)"
echo "  Charlie:  charlie@datacore.io (UPI: charlie@dc)"
echo ""
echo "Press Ctrl+C to stop both servers."
echo "=================================================="

npm run dev -- --host 0.0.0.0
