import random
import numpy as np
from dataclasses import dataclass

from core.config import GAConfig, Constraints, FitnessWeights
from core.fitness import compute_fitness
from core.kmeans import KMeansClusterer
from data_pipeline.preprocessing.grid_structure import PopulationGrid


@dataclass
class GAResult:
    best_chromosome: list
    best_fitness: float
    fitness_history: list
    best_metrics: dict
    convergence_generation: int


class GeneticAlgorithm:
    def __init__(
        self,
        config: GAConfig,
        constraints: Constraints,
        fitness_weights: FitnessWeights,
        grid: PopulationGrid
    ):
        self.config = config
        self.constraints = constraints
        self.fitness_weights = fitness_weights
        self.grid = grid
        self.bounds = grid.bounds

    def _random_gene(self):
        idx = random.randint(0, len(self.grid.cells) - 1)
        lat = self.grid.cells[idx][0]
        lng = self.grid.cells[idx][1]

        height = random.uniform(20, self.constraints.max_tower_height_m)
        power = random.uniform(25, self.constraints.max_power_dbm)

        return [lat, lng, height, power]

    def _random_chromosome(self):
        return [self._random_gene() for _ in range(self.constraints.num_towers)]

    def _initialize_population(self):
        population = []

        # random organisms
        for _ in range(self.config.population_size - 3):
            population.append(self._random_chromosome())

        # KMeans seeded organisms
        try:
            kmeans = KMeansClusterer(config=type("obj", (), {
                "n_clusters": self.constraints.num_towers,
                "max_iterations": 300,
                "n_init": 5,
                "tolerance": 1e-4
            })())

            cluster_result = kmeans.fit(self.grid)

            for _ in range(3):
                seeded = []
                for center in cluster_result.centroids:
                    lat, lng = center
                    height = random.uniform(25, self.constraints.max_tower_height_m)
                    power = random.uniform(30, self.constraints.max_power_dbm)
                    seeded.append([lat, lng, height, power])
                population.append(seeded)

        except Exception:
            pass

        return population

    def _evaluate_population(self, population):
        fitnesses = []
        results = []

        for chromosome in population:
            fit = compute_fitness(
                chromosome,
                self.grid,
                self.fitness_weights,
                self.constraints
            )
            fitnesses.append(fit.total_fitness)
            results.append(fit)

        return fitnesses, results

    def _selection(self, population, fitnesses):
        contenders = random.sample(range(len(population)), self.config.tournament_size)
        best_idx = max(contenders, key=lambda i: fitnesses[i])
        return population[best_idx]

    def _crossover(self, parent1, parent2):
        child1, child2 = [], []

        for g1, g2 in zip(parent1, parent2):
            if random.random() < 0.5:
                child1.append(g1.copy())
                child2.append(g2.copy())
            else:
                child1.append(g2.copy())
                child2.append(g1.copy())

        return child1, child2

    def _mutate(self, chromosome):
        for gene in chromosome:
            if random.random() < self.config.mutation_rate:
                idx = random.randint(0, len(self.grid.cells) - 1)
                gene[0] = self.grid.cells[idx][0]
                gene[1] = self.grid.cells[idx][1]

            if random.random() < self.config.mutation_rate:
                gene[2] = random.uniform(20, self.constraints.max_tower_height_m)

            if random.random() < self.config.mutation_rate:
                gene[3] = random.uniform(25, self.constraints.max_power_dbm)

        return chromosome

    def run(self):
        population = self._initialize_population()

        best_fitness = -9999
        best_chromosome = None
        best_metrics = None
        fitness_history = []

        patience_counter = 0
        convergence_generation = 0

        for generation in range(self.config.generations):
            fitnesses, results = self._evaluate_population(population)

            gen_best_idx = int(np.argmax(fitnesses))
            gen_best_fit = fitnesses[gen_best_idx]

            fitness_history.append(float(gen_best_fit))

            if gen_best_fit > best_fitness:
                best_fitness = gen_best_fit
                best_chromosome = population[gen_best_idx]
                best_metrics = results[gen_best_idx].raw_metrics
                convergence_generation = generation
                patience_counter = 0
            else:
                patience_counter += 1

            if patience_counter >= self.config.patience:
                break

            elite_indices = np.argsort(fitnesses)[-self.config.elitism_count:]
            new_population = [population[i] for i in elite_indices]

            while len(new_population) < self.config.population_size:
                parent1 = self._selection(population, fitnesses)
                parent2 = self._selection(population, fitnesses)

                if random.random() < self.config.crossover_rate:
                    child1, child2 = self._crossover(parent1, parent2)
                else:
                    child1, child2 = parent1.copy(), parent2.copy()

                child1 = self._mutate(child1)
                child2 = self._mutate(child2)

                new_population.append(child1)

                if len(new_population) < self.config.population_size:
                    new_population.append(child2)

            population = new_population

            print(f"Generation {generation+1}/{self.config.generations} | Best Fitness: {best_fitness:.4f}")

        return GAResult(
            best_chromosome=best_chromosome,
            best_fitness=float(best_fitness),
            fitness_history=fitness_history,
            best_metrics=best_metrics,
            convergence_generation=convergence_generation
        )