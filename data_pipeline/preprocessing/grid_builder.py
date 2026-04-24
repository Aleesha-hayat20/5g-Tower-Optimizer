import sys
import os
# ✅ FIXED: ensures package root is on path when run as a script
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import numpy as np
import geopandas as gpd
import pandas as pd
import pickle
from shapely.geometry import Point
from data_pipeline.preprocessing.grid_structure import PopulationGrid


def build_population_grid(population_gdf, buildings_gdf, resolution_m=200, bounds=None):
    print("Building grid...")

    # Step 1: Bounds
    if bounds is None:
        bounds = {
            "lat_min": float(population_gdf.geometry.y.min()),
            "lat_max": float(population_gdf.geometry.y.max()),
            "lng_min": float(population_gdf.geometry.x.min()),
            "lng_max": float(population_gdf.geometry.x.max()),
        }

    lat_min, lat_max = bounds["lat_min"], bounds["lat_max"]
    lng_min, lng_max = bounds["lng_min"], bounds["lng_max"]

    lat_step = resolution_m / 111000
    lng_step = resolution_m / (111000 * np.cos(np.radians((lat_min + lat_max) / 2)))

    lat_bins = np.arange(lat_min, lat_max, lat_step)
    lng_bins = np.arange(lng_min, lng_max, lng_step)
    n_lat, n_lng = len(lat_bins), len(lng_bins)

    print(f"Grid size: {n_lat} x {n_lng} = {n_lat * n_lng} cells")

    # ✅ PERFORMANCE: vectorized binning with np.digitize instead of nested loops
    pop_lats = population_gdf.geometry.y.values
    pop_lngs = population_gdf.geometry.x.values
    pop_vals = population_gdf["population"].values

    pop_lat_idx = np.digitize(pop_lats, lat_bins) - 1
    pop_lng_idx = np.digitize(pop_lngs, lng_bins) - 1

    valid_pop = (
        (pop_lat_idx >= 0) & (pop_lat_idx < n_lat) &
        (pop_lng_idx >= 0) & (pop_lng_idx < n_lng)
    )
    pop_lat_idx = pop_lat_idx[valid_pop]
    pop_lng_idx = pop_lng_idx[valid_pop]
    pop_vals    = pop_vals[valid_pop]

    # Accumulate population into 2D grid
    pop_grid = np.zeros((n_lat, n_lng), dtype=np.int64)
    np.add.at(pop_grid, (pop_lat_idx, pop_lng_idx), pop_vals)

    # ✅ PERFORMANCE: vectorized building density
    # Reproject once — use metric CRS for both area AND centroid to avoid warnings
    buildings_metric = buildings_gdf.to_crs("EPSG:32642")
    bld_areas = buildings_metric.geometry.area.values
    # Back-project centroids to WGS84 for lat/lng binning
    centroids_wgs84 = buildings_metric.geometry.centroid.to_crs("EPSG:4326")
    bld_lats = centroids_wgs84.y.values
    bld_lngs = centroids_wgs84.x.values

    bld_lat_idx = np.digitize(bld_lats, lat_bins) - 1
    bld_lng_idx = np.digitize(bld_lngs, lng_bins) - 1

    valid_bld = (
        (bld_lat_idx >= 0) & (bld_lat_idx < n_lat) &
        (bld_lng_idx >= 0) & (bld_lng_idx < n_lng)
    )
    bld_lat_idx = bld_lat_idx[valid_bld]
    bld_lng_idx = bld_lng_idx[valid_bld]
    bld_areas   = bld_areas[valid_bld]

    cell_area_m2 = resolution_m ** 2
    bld_area_grid = np.zeros((n_lat, n_lng), dtype=np.float64)
    np.add.at(bld_area_grid, (bld_lat_idx, bld_lng_idx), bld_areas)
    density_grid = np.clip(bld_area_grid / cell_area_m2, 0.0, 1.0)

    # Build cells array from populated cells only
    populated = np.argwhere(pop_grid > 0)
    cells = []
    for (li, gi) in populated:
        center_lat = lat_bins[li] + lat_step / 2
        center_lng = lng_bins[gi] + lng_step / 2
        cells.append([center_lat, center_lng, float(pop_grid[li, gi]), float(density_grid[li, gi])])

    if len(cells) == 0:
        raise ValueError("No populated cells found. Check your input data.")

    cells_array = np.array(cells)

    grid = PopulationGrid(
        cells=cells_array,
        bounds=bounds,
        resolution_m=float(resolution_m),
        total_population=int(cells_array[:, 2].sum()),
        total_cells=len(cells_array),
        metadata={
            "source": "peshawar",
            "created_at": pd.Timestamp.now().isoformat(),
            "resolution_m": resolution_m,
            "lat_step": lat_step,
            "lng_step": lng_step,
        }
    )

    print(f"Grid built: {grid.total_cells} cells")
    print(f"Total population: {grid.total_population:,}")
    return grid


if __name__ == "__main__":
    print("Testing grid_builder.py...")

    df = pd.read_csv("data_pipeline/sample_data/peshawar_test_population.csv")
    pop_gdf = gpd.GeoDataFrame(
        df,
        geometry=[Point(row.longitude, row.latitude) for row in df.itertuples()],
        crs="EPSG:4326"
    )
    buildings_gdf = gpd.read_file("data_pipeline/sample_data/peshawar_test_buildings.geojson")

    grid = build_population_grid(pop_gdf, buildings_gdf, resolution_m=200)

    os.makedirs("data_pipeline/processed", exist_ok=True)
    with open("data_pipeline/processed/peshawar_grid.pkl", "wb") as f:
        pickle.dump(grid, f)
    print("Grid saved to data_pipeline/processed/peshawar_grid.pkl ✔")