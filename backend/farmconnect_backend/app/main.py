# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import os
# from .database import engine, Base
# # from .routers import listings, bookings, messages, profiles, favorites, reviews
# # from ..routers import listings, bookings, messages, profiles, favorites, reviews
# from routers import listings, bookings, messages, profiles, favorites, reviews
# import sys
# import os
# sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
# # Create tables (if not using Alembic)
# Base.metadata.create_all(bind=engine)

# app = FastAPI(title="Farming Lease Backend", version="1.0.0")

# # CORS for frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],  # Vite default
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(listings.router)
# app.include_router(bookings.router)
# app.include_router(messages.router)
# app.include_router(profiles.router)
# app.include_router(favorites.router)
# app.include_router(reviews.router)

# @app.get("/")
# def read_root():
#     return {"message": "Farming Backend API - Ready for leasing!"}






from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from app.database import engine, Base
from routers import listings, bookings, messages, profiles, favorites, reviews

# Add project root to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Create tables (if not using Alembic)
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="Farming Lease Backend", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(messages.router)
app.include_router(profiles.router)
app.include_router(favorites.router)
app.include_router(reviews.router)

@app.get("/")
def read_root():
    return {"message": "Farming Backend API - Ready for leasing!"}