import sys
from copy import deepcopy
sys.path.append("..")

import pickle
from celery import Celery

from core.genetic_algorithm import GeneticAlgorithm
from core.config import (
    GAConfig,
    DEFAULT_CONSTRAINTS,
    DEFAULT_FITNESS_WEIGHTS
)
from core.result_formatter import sanitize_metrics
from core.cache_manager import save_result

celery_app = Celery(
    "tower_optimizer_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)


@celery_app.task
def run_optimization_task(city="peshawar", num_towers=10, population_size=20, generations=10):
    grid_path = f"../data_pipeline/processed/{city}_grid.pkl"

    with open(grid_path, "rb") as f:
        grid = pickle.load(f)

    constraints = deepcopy(DEFAULT_CONSTRAINTS)
    constraints.num_towers = num_towers

    ga_config = GAConfig(
        population_size=population_size,
        generations=generations
    )

    ga = GeneticAlgorithm(
        config=ga_config,
        constraints=constraints,
        fitness_weights=DEFAULT_FITNESS_WEIGHTS,
        grid=grid
    )

    result = ga.run()

    payload = {
        "best_fitness": result.best_fitness,
        "convergence_generation": result.convergence_generation,
        "fitness_history": result.fitness_history,
        "optimized_towers": result.best_chromosome,
        "metrics": sanitize_metrics(result.best_metrics)
    }

    save_result(city, payload)

    return payload