import numpy as np
from data_pipeline.preprocessing.grid_structure import PopulationGrid


class CoverageScorer:
    def __init__(self, signal_model, min_snr_db=-70):
        self.signal_model = signal_model
        self.min_snr_db = min_snr_db

    def calculate_tower_coverage(self, tower, grid):
        """
        Calculate coverage stats for a single tower.

        Returns:
            {
                "covered_population": int,
                "coverage_percent": float,
                "avg_snr_db": float,
                "coverage_radius_m": float,
                "snr_map": np.ndarray   # SNR at each grid cell
            }
        """
        snr_map = np.zeros(len(grid.cells))

        for i, cell in enumerate(grid.cells):
            lat, lng, population, building_density = cell

            snr = self.signal_model.calculate_snr(
                tx_power_dbm=tower["power_dbm"],
                tx_height_m=tower["height_m"],
                rx_lat=lat,
                rx_lng=lng,
                tower_lat=tower["lat"],
                tower_lng=tower["lng"],
                building_density=building_density,
            )

            snr_map[i] = snr

        # Coverage mask
        covered_mask = snr_map >= self.min_snr_db
        covered_population = int(grid.cells[covered_mask, 2].sum())
        coverage_percent = (covered_population / grid.total_population) * 100 if grid.total_population > 0 else 0.0

        # Coverage radius — max distance to a covered cell
        from data_pipeline.signal.propagation import haversine
        covered_cells = grid.cells[covered_mask]
        if len(covered_cells) > 0:
            distances = [
                haversine(tower["lat"], tower["lng"], cell[0], cell[1])
                for cell in covered_cells
            ]
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
        Calculate aggregate coverage for all towers.
        Each person counted ONCE even if covered by multiple towers.

        Returns:
            {
                "total_covered_population": int,
                "coverage_percent": float,
                "avg_snr_db": float,
                "interference_score": float,
                "per_tower_coverage": list[dict],
                "overlap_percent": float,
            }
        """
        n_cells = len(grid.cells)

        # SNR matrix: rows = towers, cols = grid cells
        snr_matrix = np.full((len(towers), n_cells), fill_value=-999.0)

        per_tower_coverage = []

        for t_idx, tower in enumerate(towers):
            result = self.calculate_tower_coverage(tower, grid)
            snr_matrix[t_idx] = result["snr_map"]
            per_tower_coverage.append(result)

        # Best SNR per cell (strongest tower wins)
        best_snr_per_cell = np.max(snr_matrix, axis=0)

        # Coverage mask — cell is covered if best SNR >= threshold
        covered_mask = best_snr_per_cell >= self.min_snr_db
        total_covered_population = int(grid.cells[covered_mask, 2].sum())
        coverage_percent = (total_covered_population / grid.total_population) * 100 if grid.total_population > 0 else 0.0

        # Overlap — cells covered by more than one tower
        tower_coverage_masks = snr_matrix >= self.min_snr_db          # shape: (n_towers, n_cells)
        overlap_count = tower_coverage_masks.sum(axis=0)               # per cell: how many towers cover it
        overlap_cells = np.sum(overlap_count > 1)
        overlap_percent = float((overlap_cells / n_cells) * 100) if n_cells > 0 else 0.0

        # Average SNR across covered cells only
        avg_snr = float(np.mean(best_snr_per_cell[covered_mask])) if covered_mask.any() else -999.0

        # Interference score
        interference_map = self.calculate_interference(towers, grid, snr_matrix)
        interference_score = float(np.mean(interference_map[interference_map > 0])) if np.any(interference_map > 0) else 0.0

        return {
            "total_covered_population": total_covered_population,
            "coverage_percent": float(coverage_percent),
            "avg_snr_db": avg_snr,
            "interference_score": interference_score,
            "per_tower_coverage": per_tower_coverage,
            "overlap_percent": overlap_percent,
        }

    def calculate_interference(self, towers, grid, snr_matrix=None):
        """
        Interference at each cell = sum of signals from all towers EXCEPT the strongest.
        Returns array of interference values in dBm per grid cell.
        """
        n_cells = len(grid.cells)

        if snr_matrix is None:
            snr_matrix = np.full((len(towers), n_cells), fill_value=-999.0)
            for t_idx, tower in enumerate(towers):
                result = self.calculate_tower_coverage(tower, grid)
                snr_matrix[t_idx] = result["snr_map"]

        if len(towers) <= 1:
            # No interference with a single tower
            return np.zeros(n_cells)

        interference_map = np.zeros(n_cells)

        for cell_idx in range(n_cells):
            cell_snrs = snr_matrix[:, cell_idx]

            # Convert SNR (dB) to linear power for summation
            cell_powers = 10 ** (cell_snrs / 10)

            # Strongest tower
            strongest_idx = np.argmax(cell_snrs)
            strongest_power = cell_powers[strongest_idx]

            # Sum of all other towers = interference
            total_power = np.sum(cell_powers)
            interference_power = total_power - strongest_power

            if interference_power > 0:
                interference_map[cell_idx] = 10 * np.log10(interference_power)  # back to dB

        return interference_map


if __name__ == "__main__":
    import pickle
    from data_pipeline.signal.propagation import SignalModel

    print("Testing coverage_scorer.py...")

    # Load grid
    with open("data_pipeline/processed/peshawar_grid.pkl", "rb") as f:
        grid = pickle.load(f)

    print(f"Grid loaded: {grid.total_cells} cells, population: {grid.total_population:,}")

    model = SignalModel()
    scorer = CoverageScorer(model)

    # --- Test 1: Single tower ---
    tower = {
        "lat": grid.cells[len(grid.cells) // 2][0],  # middle cell
        "lng": grid.cells[len(grid.cells) // 2][1],
        "height_m": 30,
        "power_dbm": 30,
    }

    result = scorer.calculate_tower_coverage(tower, grid)
    print("\n--- Single Tower Coverage ---")
    print(f"Covered Population : {result['covered_population']:,}")
    print(f"Coverage %         : {result['coverage_percent']:.2f}%")
    print(f"Avg SNR            : {result['avg_snr_db']:.2f} dB")
    print(f"Coverage Radius    : {result['coverage_radius_m']:.0f}m")

    # --- Test 2: Multi tower ---
    towers = [
        {"lat": grid.cells[0][0],                       "lng": grid.cells[0][1],                       "height_m": 30, "power_dbm": 30},
        {"lat": grid.cells[len(grid.cells) // 2][0],    "lng": grid.cells[len(grid.cells) // 2][1],    "height_m": 30, "power_dbm": 30},
        {"lat": grid.cells[-1][0],                      "lng": grid.cells[-1][1],                      "height_m": 30, "power_dbm": 30},
    ]

    total = scorer.calculate_total_coverage(towers, grid)
    print("\n--- Multi Tower Coverage (3 towers) ---")
    print(f"Total Covered Pop  : {total['total_covered_population']:,}")
    print(f"Coverage %         : {total['coverage_percent']:.2f}%")
    print(f"Avg SNR            : {total['avg_snr_db']:.2f} dB")
    print(f"Overlap %          : {total['overlap_percent']:.2f}%")
    print(f"Interference Score : {total['interference_score']:.2f} dB")

    print("\ncoverage_scorer.py working ✔")