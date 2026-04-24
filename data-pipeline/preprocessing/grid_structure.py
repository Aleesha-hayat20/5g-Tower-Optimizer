from dataclasses import dataclass
import numpy as np


@dataclass
class PopulationGrid:
    cells: np.ndarray
    bounds: dict
    resolution_m: float
    total_population: int
    total_cells: int
    metadata: dict