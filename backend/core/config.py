from dataclasses import dataclass, field


@dataclass
class GAConfig:
    population_size: int = 30
    generations: int = 20
    mutation_rate: float = 0.05
    crossover_rate: float = 0.85
    tournament_size: int = 3
    elitism_count: int = 2
    adaptive_mutation: bool = True
    patience: int = 8


@dataclass
class KMeansConfig:
    n_clusters: int = 10
    max_iterations: int = 300
    n_init: int = 10
    tolerance: float = 1e-4


@dataclass
class Constraints:
    num_towers: int = 10
    min_tower_distance_m: float = 200.0
    max_tower_height_m: float = 45.0
    min_snr_db: float = -70.0
    max_power_dbm: float = 46.0


@dataclass
class FitnessWeights:
    coverage: float = 0.50
    snr: float = 0.25
    interference: float = 0.15
    cost: float = 0.10


DEFAULT_GA_CONFIG = GAConfig()
DEFAULT_KMEANS_CONFIG = KMeansConfig()
DEFAULT_CONSTRAINTS = Constraints()
DEFAULT_FITNESS_WEIGHTS = FitnessWeights()