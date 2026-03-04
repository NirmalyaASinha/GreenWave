#!/bin/bash
# GreenWave Backend Startup Script

set -e

echo "🚀 Starting GreenWave Backend..."

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Initialize database
echo "Initializing database..."
python -c "from backend.database import init_db; init_db()" 2>/dev/null || echo "Database already initialized"

# Start server
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ GreenWave Backend Ready"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📎 API Documentation: http://localhost:8000/docs"
echo "🌐 WebSocket: ws://localhost:8000/ws"
echo ""
echo "Starting server..."
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
