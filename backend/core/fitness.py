from dataclasses import dataclass
import numpy as np

from core.config import FitnessWeights, Constraints
from data_pipeline.signal.propagation import SignalModel
from data_pipeline.signal.coverage_scorer import CoverageScorer
from data_pipeline.preprocessing.grid_structure import PopulationGrid


@dataclass
class FitnessResult:
    total_fitness: float
    coverage_score: float
    snr_score: float
    interference_penalty: float
    cost_penalty: float
    raw_metrics: dict


def chromosome_to_towers(chromosome):
    """
    Convert chromosome genes into CoverageScorer-compatible tower dicts.
    Each gene = [lat, lng, height_m, power_dbm]
    """
    towers = []

    for gene in chromosome:
        towers.append({
            "lat": float(gene[0]),
            "lng": float(gene[1]),
            "height_m": float(gene[2]),
            "power_dbm": float(gene[3]),
        })

    return towers


def compute_cost_penalty(chromosome, constraints: Constraints) -> float:
    """
    Penalize expensive tower layouts.
    Higher towers + higher power = more cost.
    """
    total_cost = 0.0

    for gene in chromosome:
        height_cost = gene[2] / constraints.max_tower_height_m
        power_cost = gene[3] / constraints.max_power_dbm
        total_cost += (height_cost + power_cost) / 2

    normalized_cost = total_cost / len(chromosome)
    return float(normalized_cost)


def compute_spacing_penalty(chromosome, constraints: Constraints) -> float:
    """
    Penalize towers that are too close together.
    """
    from data_pipeline.signal.propagation import haversine

    penalty = 0.0

    for i in range(len(chromosome)):
        for j in range(i + 1, len(chromosome)):
            d = haversine(
                chromosome[i][0], chromosome[i][1],
                chromosome[j][0], chromosome[j][1]
            )

            if d < constraints.min_tower_distance_m:
                penalty += (constraints.min_tower_distance_m - d) / constraints.min_tower_distance_m

    return float(penalty)


def compute_fitness(
    chromosome,
    grid: PopulationGrid,
    weights: FitnessWeights,
    constraints: Constraints,
):
    """
    Main multi-objective fitness evaluator.
    """

    signal_model = SignalModel(noise_floor_dbm=-95)
    scorer = CoverageScorer(signal_model, min_snr_db=constraints.min_snr_db)

    towers = chromosome_to_towers(chromosome)

    coverage_stats = scorer.calculate_total_coverage(towers, grid)

    coverage_score = coverage_stats["coverage_percent"] / 100.0

    avg_snr = coverage_stats["avg_snr_db"]
    snr_score = max(0.0, min(1.0, (avg_snr + 100) / 100))

    interference_penalty = coverage_stats["interference_score"] / 100.0
    cost_penalty = compute_cost_penalty(chromosome, constraints)
    spacing_penalty = compute_spacing_penalty(chromosome, constraints)

    total = (
        weights.coverage * coverage_score
        + weights.snr * snr_score
        - weights.interference * interference_penalty
        - weights.cost * cost_penalty
        - 0.10 * spacing_penalty
    )

    return FitnessResult(
        total_fitness=float(total),
        coverage_score=float(coverage_score),
        snr_score=float(snr_score),
        interference_penalty=float(interference_penalty + spacing_penalty),
        cost_penalty=float(cost_penalty),
        raw_metrics=coverage_stats,
    )