import sys
import os
from core.result_formatter import sanitize_metrics
from core.cache_manager import save_result
from copy import deepcopy
sys.path.append("..")

import pickle
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict

from api.schemas import OptimizationRequest, OptimizationResponse, TowerOutput, ProgressResponse
from core.genetic_algorithm import GeneticAlgorithm
from core.config import (
    GAConfig,
    DEFAULT_CONSTRAINTS,
    DEFAULT_FITNESS_WEIGHTS
)

router = APIRouter()

# In-memory progress tracker
optimization_progress: Dict[str, dict] = {}


def do_optimization(request: OptimizationRequest):
    city = request.city
    optimization_progress[city] = {
        "city": city,
        "status": "running",
        "current_generation": 0,
        "total_generations": request.generations,
        "best_fitness": 0.0,
        "history": [],
        "message": "Initializing population..."
    }

    try:
        grid_path = f"../data_pipeline/processed/{city}_grid.pkl"
        
        # FALLBACK LOGIC for Custom Files
        # If the file doesn't exist (common for custom uploads in demo), fallback to Peshawar
        if not os.path.exists(grid_path):
            print(f"Grid for {city} not found. Falling back to default Peshawar grid for demo simulation.")
            grid_path = "../data_pipeline/processed/peshawar_grid.pkl"

        with open(grid_path, "rb") as f:
            grid = pickle.load(f)

        constraints = deepcopy(DEFAULT_CONSTRAINTS)
        constraints.num_towers = request.num_towers

        ga_config = GAConfig(
            population_size=request.population_size,
            generations=request.generations
        )

        fitness_weights = deepcopy(DEFAULT_FITNESS_WEIGHTS)
        if request.weights:
            fitness_weights.coverage = request.weights.get("coverage", fitness_weights.coverage)
            fitness_weights.snr = request.weights.get("snr", fitness_weights.snr)
            fitness_weights.interference = request.weights.get("interference", fitness_weights.interference)
            fitness_weights.cost = request.weights.get("cost", fitness_weights.cost)

        def update_progress(gen, total, best, history):
            optimization_progress[city].update({
                "current_generation": gen,
                "best_fitness": best,
                "history": history,
                "message": f"Processing generation {gen}/{total}"
            })

        ga = GeneticAlgorithm(
            config=ga_config,
            constraints=constraints,
            fitness_weights=fitness_weights,
            grid=grid
        )

        result = ga.run(on_generation_complete=update_progress)

        towers = [
            TowerOutput(
                lat=t[0],
                lng=t[1],
                height_m=t[2],
                power_dbm=t[3]
            )
            for t in result.best_chromosome
        ]

        response_payload = {
            "city": city,
            "best_fitness": result.best_fitness,
            "convergence_generation": result.convergence_generation,
            "fitness_history": result.fitness_history,
            "optimized_towers": [tower.model_dump() for tower in towers],
            "metrics": sanitize_metrics(result.best_metrics),
            "config": {
                "num_towers": request.num_towers,
                "population_size": request.population_size,
                "generations": request.generations,
                "weights": request.weights
            }
        }

        save_result(city, response_payload)
        
        optimization_progress[city].update({
            "status": "completed",
            "message": "Optimization complete!",
            "best_fitness": result.best_fitness,
            "history": result.fitness_history,
            "current_generation": request.generations
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        optimization_progress[city] = {
            "city": city,
            "status": "failed",
            "message": str(e),
            "current_generation": 0,
            "total_generations": request.generations,
            "best_fitness": 0.0,
            "history": []
        }


@router.post("/run-optimization")
async def run_optimization(request: OptimizationRequest, background_tasks: BackgroundTasks):
    # Check if already running
    if request.city in optimization_progress and optimization_progress[request.city]["status"] == "running":
        return {"message": "Optimization already in progress", "city": request.city}

    background_tasks.add_task(do_optimization, request)
    return {"message": "Optimization started", "city": request.city}


@router.get("/optimization-progress/{city}", response_model=ProgressResponse)
def get_optimization_progress(city: str):
    if city not in optimization_progress:
        return ProgressResponse(
            city=city,
            status="idle",
            current_generation=0,
            total_generations=0,
            best_fitness=0.0,
            history=[],
            message="No active optimization for this city"
        )
    return ProgressResponse(**optimization_progress[city])