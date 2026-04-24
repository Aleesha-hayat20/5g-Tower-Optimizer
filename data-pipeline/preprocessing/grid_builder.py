import numpy as np
import geopandas as gpd
from data_pipeline.preprocessing.grid_structure import PopulationGrid
import pickle

def build_population_grid(population_gdf, buildings_gdf, resolution_m=200):
    print("Building grid...")

    # Step 1: Bounds
    lat_min = population_gdf.geometry.y.min()
    lat_max = population_gdf.geometry.y.max()
    lng_min = population_gdf.geometry.x.min()
    lng_max = population_gdf.geometry.x.max()

    bounds = {
        "lat_min": float(lat_min),
        "lat_max": float(lat_max),
        "lng_min": float(lng_min),
        "lng_max": float(lng_max),
    }

    # Step 2: Grid step (~200m approximation)
    lat_step = 0.002
    lng_step = 0.002

    lat_bins = np.arange(lat_min, lat_max, lat_step)
    lng_bins = np.arange(lng_min, lng_max, lng_step)

    # ✅ FIX 1: Precompute building centroids ONCE (major speedup)
    buildings_gdf = buildings_gdf.copy()
    buildings_gdf['centroid'] = buildings_gdf.geometry.centroid
    buildings_gdf['centroid_y'] = buildings_gdf['centroid'].y
    buildings_gdf['centroid_x'] = buildings_gdf['centroid'].x

    cells = []

    # Step 3: Loop grid
    for lat in lat_bins:
        for lng in lng_bins:

            lat_high = lat + lat_step
            lng_high = lng + lng_step

            # Population filter
            pop_mask = (
                (population_gdf.geometry.y >= lat) &
                (population_gdf.geometry.y < lat_high) &
                (population_gdf.geometry.x >= lng) &
                (population_gdf.geometry.x < lng_high)
            )

            pop_points = population_gdf[pop_mask]
            population = pop_points['population'].sum()

            if population == 0:
                continue

            # Building density (FAST version using precomputed centroids)
            bmask = (
                (buildings_gdf['centroid_y'] >= lat) &
                (buildings_gdf['centroid_y'] < lat_high) &
                (buildings_gdf['centroid_x'] >= lng) &
                (buildings_gdf['centroid_x'] < lng_high)
            )

            buildings = buildings_gdf[bmask]
            building_density = min(1.0, len(buildings) / 10)

            # Cell center
            center_lat = lat + lat_step / 2
            center_lng = lng + lng_step / 2

            cells.append([center_lat, center_lng, population, building_density])

    cells_array = np.array(cells)

    grid = PopulationGrid(
        cells=cells_array,
        bounds=bounds,
        resolution_m=resolution_m,
        total_population=int(cells_array[:, 2].sum()) if len(cells_array) > 0 else 0,
        total_cells=len(cells_array),
        metadata={"source": "peshawar_test"}
    )

    print(f"Grid built: {grid.total_cells} cells")
    print(f"Total population: {grid.total_population}")

    return grid


if __name__ == "__main__":
    import pandas as pd
    from shapely.geometry import Point
    import os

    print("Testing grid_builder.py...")

    # ✅ FIX 2: Use smaller dataset for speed (temporary)
    df = pd.read_csv("data_pipeline/sample_data/peshawar_population.csv").head(300)

    pop_gdf = gpd.GeoDataFrame(
        df,
        geometry=[Point(r.longitude, r.latitude) for r in df.itertuples()],
        crs="EPSG:4326"
    )

    # Temporary buildings (same as population)
    buildings_gdf = pop_gdf.copy()

    grid = build_population_grid(pop_gdf, buildings_gdf)

    # Ensure directory exists
    os.makedirs("data_pipeline/processed", exist_ok=True)

    # Save grid
    with open("data_pipeline/processed/peshawar_grid.pkl", "wb") as f:
        pickle.dump(grid, f)

    print("Grid saved ✔")