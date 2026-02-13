#!/bin/bash
# AICompany Dashboard launcher

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE="${1:-dev}"

if [ "$MODE" = "dev" ]; then
    echo "Starting AICompany Dashboard in development mode..."
    echo ""
    echo "Backend: http://localhost:8080"
    echo "Frontend: http://localhost:5173"
    echo ""

    # Start backend
    cd "$SCRIPT_DIR"
    PYTHONPATH="$SCRIPT_DIR/.." uvicorn server:app --reload --port 8080 &
    BACKEND_PID=$!

    # Start frontend
    cd "$SCRIPT_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!

    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    wait

elif [ "$MODE" = "build" ]; then
    echo "Building frontend..."
    cd "$SCRIPT_DIR/frontend"
    npm run build
    echo "Build complete. Static files in dashboard/frontend/dist/"

elif [ "$MODE" = "prod" ]; then
    echo "Starting AICompany Dashboard in production mode..."
    echo ""

    # Build frontend if not built
    if [ ! -d "$SCRIPT_DIR/frontend/dist" ]; then
        echo "Building frontend first..."
        cd "$SCRIPT_DIR/frontend"
        npm run build
    fi

    # Start server (serves both API and static files)
    cd "$SCRIPT_DIR"
    PYTHONPATH="$SCRIPT_DIR/.." uvicorn server:app --host 0.0.0.0 --port 8080
    echo "Dashboard: http://localhost:8080"
else
    echo "Usage: ./run.sh [dev|build|prod]"
    echo "  dev   - Start both backend and frontend dev servers"
    echo "  build - Build frontend static files"
    echo "  prod  - Start production server (API + static files)"
fi
