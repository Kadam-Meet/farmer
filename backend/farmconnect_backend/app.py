from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from farmer_main import router as farmer_router
from worker_main import router as worker_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API is running!"}

# include routers
app.include_router(farmer_router, prefix="/farmer", tags=["Farmer"])
app.include_router(worker_router, prefix="/worker", tags=["Worker"])
