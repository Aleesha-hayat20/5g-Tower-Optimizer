import sys
from core.result_formatter import sanitize_metrics
from core.cache_manager import save_result
from copy import deepcopy
sys.path.append("..")

import pickle
from fastapi import APIRouter, HTTPException

from api.schemas import OptimizationRequest, OptimizationResponse, TowerOutput
from core.genetic_algorithm import GeneticAlgorithm
from core.config import (
    GAConfig,
    DEFAULT_CONSTRAINTS,
    DEFAULT_FITNESS_WEIGHTS
)

router = APIRouter()


@router.post("/run-optimization", response_model=OptimizationResponse)
def run_optimization(request: OptimizationRequest):
    try:
        grid_path = f"../data_pipeline/processed/{request.city}_grid.pkl"

        with open(grid_path, "rb") as f:
            grid = pickle.load(f)

        constraints = deepcopy(DEFAULT_CONSTRAINTS)
        constraints.num_towers = request.num_towers

        ga_config = GAConfig(
            population_size=request.population_size,
            generations=request.generations
        )

        ga = GeneticAlgorithm(
            config=ga_config,
            constraints=constraints,
            fitness_weights=DEFAULT_FITNESS_WEIGHTS,
            grid=grid
        )

        result = ga.run()

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
            "best_fitness": result.best_fitness,
            "convergence_generation": result.convergence_generation,
            "fitness_history": result.fitness_history,
            "optimized_towers": [tower.model_dump() for tower in towers],
            "metrics": sanitize_metrics(result.best_metrics)
        }

        save_result(request.city, response_payload)

        return OptimizationResponse(**response_payload)
           
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Processed grid for city '{request.city}' not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))