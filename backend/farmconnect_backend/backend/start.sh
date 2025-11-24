#!/bin/bash

# Startup script for FastAPI backend

set -e

echo "🌾 Starting Farmer Chatbot API..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
python -c "
import time
import psycopg2
from urllib.parse import urlparse
import os

db_url = os.getenv('DATABASE_URL', '').replace('postgresql+asyncpg://', 'postgresql://')
parsed = urlparse(db_url)

max_retries = 30
retry = 0

while retry < max_retries:
    try:
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path[1:]
        )
        conn.close()
        print('✅ Database is ready!')
        break
    except Exception as e:
        retry += 1
        print(f'⏳ Waiting for database... ({retry}/{max_retries})')
        time.sleep(2)
        if retry == max_retries:
            print('❌ Could not connect to database')
            exit(1)
"

# Initialize database tables
echo "📊 Initializing database..."
# Tables are created automatically via lifespan in main.py

# Seed database if needed
if [ "$SEED_DB" = "true" ]; then
    echo "🌱 Seeding database..."
    python seed_db.py
fi

# Start the application
echo "🚀 Starting server..."
exec uvicorn app.main:app \
    --host ${HOST:-0.0.0.0} \
    --port ${PORT:-8000} \
    ${RELOAD:+--reload}
