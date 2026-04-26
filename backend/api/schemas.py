from pydantic import BaseModel
from typing import List, Dict, Optional


class OptimizationRequest(BaseModel):
    city: str = "peshawar"
    num_towers: int = 10
    population_size: int = 20
    generations: int = 10
    weights: Optional[Dict[str, float]] = None


class ClusterRequest(BaseModel):
    city: str = "peshawar"
    n_clusters: int = 10


class TowerOutput(BaseModel):
    lat: float
    lng: float
    height_m: float
    power_dbm: float


class OptimizationResponse(BaseModel):
    best_fitness: float
    convergence_generation: int
    fitness_history: List[float]
    optimized_towers: List[TowerOutput]
    metrics: Dict


class ClusterResponse(BaseModel):
    centroids: List[List[float]]
    cluster_populations: List[int]
    iterations: int
    converged: bool


class ProgressResponse(BaseModel):
    city: str
    status: str  # "running", "completed", "failed", "idle"
    current_generation: int
    total_generations: int
    best_fitness: float
    history: List[float]
    message: Optional[str] = None