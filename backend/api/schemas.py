from pydantic import BaseModel
from typing import List, Dict, Optional


class OptimizationRequest(BaseModel):
    city: str = "peshawar"
    num_towers: int = 10
    population_size: int = 20
    generations: int = 10


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