import numpy as np
from dataclasses import dataclass
from sklearn.cluster import KMeans

from data_pipeline.preprocessing.grid_structure import PopulationGrid
from core.config import KMeansConfig


@dataclass
class ClusterResult:
    centroids: np.ndarray
    labels: np.ndarray
    inertia: float
    converged: bool
    iterations: int
    cluster_populations: list


class KMeansClusterer:
    def __init__(self, config: KMeansConfig):
        self.config = config

    def fit(self, grid: PopulationGrid) -> ClusterResult:
        """
        Run weighted K-Means on [lat, lng] coordinates using population as sample weights.
        """
        coords = grid.cells[:, :2]
        populations = grid.cells[:, 2]

        model = KMeans(
            n_clusters=self.config.n_clusters,
            max_iter=self.config.max_iterations,
            n_init=self.config.n_init,
            tol=self.config.tolerance,
            random_state=42
        )

        model.fit(coords, sample_weight=populations)

        labels = model.labels_
        centroids = model.cluster_centers_

        cluster_populations = []
        for i in range(self.config.n_clusters):
            mask = labels == i
            cluster_populations.append(int(np.sum(populations[mask])))

        converged = model.n_iter_ < self.config.max_iterations

        return ClusterResult(
            centroids=centroids,
            labels=labels,
            inertia=float(model.inertia_),
            converged=converged,
            iterations=model.n_iter_,
            cluster_populations=cluster_populations
        )