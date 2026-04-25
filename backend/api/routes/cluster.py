import sys
sys.path.append("..")

import pickle
from fastapi import APIRouter, HTTPException

from api.schemas import ClusterRequest, ClusterResponse
from core.kmeans import KMeansClusterer
from core.config import KMeansConfig

router = APIRouter()


@router.post("/run-clustering", response_model=ClusterResponse)
def run_clustering(request: ClusterRequest):
    try:
        grid_path = f"../data_pipeline/processed/{request.city}_grid.pkl"

        with open(grid_path, "rb") as f:
            grid = pickle.load(f)

        config = KMeansConfig(n_clusters=request.n_clusters)
        clusterer = KMeansClusterer(config)
        result = clusterer.fit(grid)

        return ClusterResponse(
            centroids=result.centroids.tolist(),
            cluster_populations=result.cluster_populations,
            iterations=result.iterations,
            converged=result.converged
        )

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Processed grid for city '{request.city}' not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))