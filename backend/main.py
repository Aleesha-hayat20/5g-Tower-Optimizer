from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.results import router as results_router
from api.routes.cluster import router as cluster_router
from api.routes.optimize import router as optimize_router

app = FastAPI(
    title="5G Tower Placement Optimizer Backend",
    version="1.0.0"
)

# allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "5G Tower Placement Optimizer Backend Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(cluster_router)
app.include_router(optimize_router)
app.include_router(results_router)