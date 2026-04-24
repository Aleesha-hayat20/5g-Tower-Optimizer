import numpy as np


class CoverageScorer:
    def __init__(self, signal_model, min_snr_db=-70):
        self.signal_model = signal_model
        self.min_snr_db = min_snr_db

    def calculate_tower_coverage(self, tower, grid):
        covered_population = 0
        snr_values = []

        for cell in grid.cells:
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

            snr_values.append(snr)

            if snr >= self.min_snr_db:
                covered_population += population

        coverage_percent = (covered_population / grid.total_population) * 100

        return {
            "covered_population": int(covered_population),
            "coverage_percent": coverage_percent,
            "avg_snr_db": float(np.mean(snr_values)),
        }


if __name__ == "__main__":
    import pickle
    from propagation import SignalModel

    print("Testing coverage_scorer.py...")

    # Load grid
    with open("data-pipeline/processed/peshawar_grid.pkl", "rb") as f:
        grid = pickle.load(f)

    model = SignalModel()
    scorer = CoverageScorer(model)

    # Example tower
    tower = {
        "lat": grid.cells[0][0],
        "lng": grid.cells[0][1],
        "height_m": 30,
        "power_dbm": 30,
    }

    result = scorer.calculate_tower_coverage(tower, grid)

    print("\nCoverage Result:")
    print(f"Covered Population: {result['covered_population']}")
    print(f"Coverage %: {result['coverage_percent']:.2f}")
    print(f"Avg SNR: {result['avg_snr_db']:.2f} dB")

    print("\ncoverage_scorer.py working ✔")