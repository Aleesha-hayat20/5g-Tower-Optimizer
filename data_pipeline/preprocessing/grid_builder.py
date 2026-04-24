import numpy as np
import geopandas as gpd
from data_pipeline.preprocessing.grid_structure import PopulationGrid
import pickle
import os
import pandas as pd
from shapely.geometry import Point


def build_population_grid(population_gdf, buildings_gdf, resolution_m=200, bounds=None):
    print("Building grid...")

    # Step 1: Compute bounds
    if bounds is None:
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
    else:
        lat_min = bounds["lat_min"]
        lat_max = bounds["lat_max"]
        lng_min = bounds["lng_min"]
        lng_max = bounds["lng_max"]

    # Step 2: Convert resolution_m to degrees properly
    lat_step = resolution_m / 111000
    lng_step = resolution_m / (111000 * np.cos(np.radians((lat_min + lat_max) / 2)))

    lat_bins = np.arange(lat_min, lat_max, lat_step)
    lng_bins = np.arange(lng_min, lng_max, lng_step)

    print(f"Grid size: {len(lat_bins)} x {len(lng_bins)} = {len(lat_bins) * len(lng_bins)} cells")

    # Step 3: Precompute building centroids for speed
    buildings_gdf = buildings_gdf.copy()

    # Reproject to metric CRS for accurate area calculation
    buildings_metric = buildings_gdf.to_crs("EPSG:32642")  # UTM zone 42N — covers Pakistan

    buildings_gdf["centroid_y"] = buildings_gdf.geometry.centroid.y
    buildings_gdf["centroid_x"] = buildings_gdf.geometry.centroid.x
    buildings_metric["area_m2"] = buildings_metric.geometry.area

    # Attach metric area back to original gdf
    buildings_gdf["area_m2"] = buildings_metric["area_m2"].values

    cell_area_m2 = resolution_m ** 2

    cells = []

    # Step 4: Loop over grid cells
    for lat in lat_bins:
        for lng in lng_bins:

            lat_high = lat + lat_step
            lng_high = lng + lng_step

            # --- Population ---
            pop_mask = (
                (population_gdf.geometry.y >= lat) &
                (population_gdf.geometry.y < lat_high) &
                (population_gdf.geometry.x >= lng) &
                (population_gdf.geometry.x < lng_high)
            )

            pop_points = population_gdf[pop_mask]
            population = int(pop_points["population"].sum())

            if population == 0:
                continue

            # --- Building density ---
            bmask = (
                (buildings_gdf["centroid_y"] >= lat) &
                (buildings_gdf["centroid_y"] < lat_high) &
                (buildings_gdf["centroid_x"] >= lng) &
                (buildings_gdf["centroid_x"] < lng_high)
            )

            buildings_in_cell = buildings_gdf[bmask]

            if len(buildings_in_cell) > 0:
                total_building_area = buildings_in_cell["area_m2"].sum()
                building_density = float(min(1.0, total_building_area / cell_area_m2))
            else:
                building_density = 0.0

            # --- Cell center ---
            center_lat = lat + lat_step / 2
            center_lng = lng + lng_step / 2

            cells.append([center_lat, center_lng, population, building_density])

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

    # Load population
    df = pd.read_csv("data_pipeline/sample_data/peshawar_test_population.csv")
    pop_gdf = gpd.GeoDataFrame(
        df,
        geometry=[Point(row.longitude, row.latitude) for row in df.itertuples()],
        crs="EPSG:4326"
    )
    print(f"Loaded {len(pop_gdf)} population points")
    print(f"Total population: {df['population'].sum():,}")

    # Load real buildings
    buildings_gdf = gpd.read_file("data_pipeline/sample_data/peshawar_test_buildings.geojson")
    print(f"Loaded {len(buildings_gdf)} buildings")

    # Build grid
    grid = build_population_grid(pop_gdf, buildings_gdf, resolution_m=200)

    # Save
    os.makedirs("data_pipeline/processed", exist_ok=True)
    with open("data_pipeline/processed/peshawar_grid.pkl", "wb") as f:
        pickle.dump(grid, f)

    print("Grid saved to data_pipeline/processed/peshawar_grid.pkl ✔")