import sys
sys.path.append("..")

import pickle

from core.genetic_algorithm import GeneticAlgorithm
from core.config import GAConfig, DEFAULT_CONSTRAINTS, DEFAULT_FITNESS_WEIGHTS


def test_ga_runs():
    with open("../data_pipeline/processed/peshawar_grid.pkl", "rb") as f:
        grid = pickle.load(f)

    ga = GeneticAlgorithm(
        config=GAConfig(
            population_size=4,
            generations=2,
            mutation_rate=0.05,
            crossover_rate=0.8,
            tournament_size=2,
            elitism_count=1,
            adaptive_mutation=True,
            patience=2
        ),
        constraints=DEFAULT_CONSTRAINTS,
        fitness_weights=DEFAULT_FITNESS_WEIGHTS,
        grid=grid
    )

    result = ga.run()

    assert result.best_fitness > 0
    assert len(result.best_chromosome) == DEFAULT_CONSTRAINTS.num_towers