import numpy as np
from data_pipeline.preprocessing.grid_structure import PopulationGrid
from data_pipeline.signal.propagation import haversine

class CoverageScorer:
    def __init__(self, signal_model, min_snr_db=-70):
        self.signal_model = signal_model
        self.min_snr_db = min_snr_db

    def calculate_tower_coverage(self, tower, grid):
        """
        Vectorized coverage stats for a single tower.
        """
        # grid.cells: [lat, lng, population, building_density]
        lats = grid.cells[:, 0]
        lngs = grid.cells[:, 1]
        population = grid.cells[:, 2]
        densities = grid.cells[:, 3]

        snr_map = self.signal_model.calculate_snr(
            tx_power_dbm=tower["power_dbm"],
            tx_height_m=tower["height_m"],
            rx_lat=lats,
            rx_lng=lngs,
            tower_lat=tower["lat"],
            tower_lng=tower["lng"],
            building_density=densities,
        )

        covered_mask = snr_map >= self.min_snr_db
        covered_population = int(np.sum(population[covered_mask]))
        coverage_percent = (covered_population / grid.total_population) * 100 if grid.total_population > 0 else 0.0

        if np.any(covered_mask):
            distances = haversine(tower["lat"], tower["lng"], lats[covered_mask], lngs[covered_mask])
            coverage_radius_m = float(np.max(distances))
        else:
            coverage_radius_m = 0.0

        return {
            "covered_population": covered_population,
            "coverage_percent": float(coverage_percent),
            "avg_snr_db": float(np.mean(snr_map)),
            "coverage_radius_m": coverage_radius_m,
            "snr_map": snr_map,
        }

    def calculate_total_coverage(self, towers, grid):
        """
        Highly optimized vectorized aggregate coverage.
        """
        n_cells = len(grid.cells)
        n_towers = len(towers)
        
        # grid.cells: [lat, lng, population, building_density]
        lats = grid.cells[:, 0]
        lngs = grid.cells[:, 1]
        population = grid.cells[:, 2]
        densities = grid.cells[:, 3]

        # Extract tower properties into arrays
        tower_lats = np.array([t["lat"] for t in towers]).reshape(-1, 1)
        tower_lngs = np.array([t["lng"] for t in towers]).reshape(-1, 1)
        tower_powers = np.array([t["power_dbm"] for t in towers]).reshape(-1, 1)
        tower_heights = np.array([t["height_m"] for t in towers]).reshape(-1, 1)

        # Vectorized SNR Matrix calculation: (n_towers, n_cells)
        # We pass tower arrays and cell arrays to signal_model
        snr_matrix = self.signal_model.calculate_snr(
            tx_power_dbm=tower_powers,
            tx_height_m=tower_heights,
            rx_lat=lats,
            rx_lng=lngs,
            tower_lat=tower_lats,
            tower_lng=tower_lngs,
            building_density=densities,
        )

        best_snr_per_cell = np.max(snr_matrix, axis=0)
        covered_mask = best_snr_per_cell >= self.min_snr_db
        total_covered_population = int(np.sum(population[covered_mask]))
        coverage_percent = (total_covered_population / grid.total_population) * 100 if grid.total_population > 0 else 0.0

        avg_snr = float(np.mean(best_snr_per_cell[covered_mask])) if np.any(covered_mask) else -99.0

        # Optimized interference calculation
        # Convert dBm to linear scale for power summation
        cell_powers = 10 ** (snr_matrix / 10)
        total_power = np.sum(cell_powers, axis=0)
        strongest_power = np.max(cell_powers, axis=0)
        interference_power = total_power - strongest_power
        
        # Avoid log10(0)
        interference_power = np.maximum(1e-15, interference_power)
        interference_map = 10 * np.log10(interference_power)
        interference_score = float(np.mean(interference_map[interference_map > -100])) if np.any(interference_map > -100) else 0.0

        # Optional: Per-tower stats (only if needed for UI, but skip during GA for speed)
        # For simplicity and speed during GA, we only return what's necessary
        return {
            "total_covered_population": total_covered_population,
            "coverage_percent": float(coverage_percent),
            "avg_snr_db": avg_snr,
            "interference_score": interference_score,
            "best_snr_per_cell": best_snr_per_cell,
            "snr_matrix": snr_matrix
        }