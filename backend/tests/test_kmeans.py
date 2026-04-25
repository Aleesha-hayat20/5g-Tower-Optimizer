import sys
sys.path.append("..")

import pickle

from core.kmeans import KMeansClusterer
from core.config import KMeansConfig


def test_kmeans_runs():
    with open("../data_pipeline/processed/peshawar_grid.pkl", "rb") as f:
        grid = pickle.load(f)

    clusterer = KMeansClusterer(KMeansConfig(n_clusters=5))
    result = clusterer.fit(grid)

    assert len(result.centroids) == 5
    assert len(result.cluster_populations) == 5
    assert result.iterations > 0