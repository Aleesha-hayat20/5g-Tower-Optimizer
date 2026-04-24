import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, Polygon
import os


def generate_synthetic_city(
    name="peshawar_test",
    area_km2=25,
    center_lat=34.0151,
    center_lng=71.5249,
    num_population_points=5000,
    num_buildings=2000,
    seed=42
):
    """
    Generate realistic synthetic city data for Peshawar.
    Population density follows Gaussian mixture (city center + suburbs)
    """
    np.random.seed(seed)

    # Peshawar hotspot centers
    hotspots = [
        (34.0151, 71.5249, 0.35),  # Saddar - main center
        (34.0050, 71.5350, 0.25),  # University Town
        (34.0200, 71.5800, 0.20),  # Hayatabad
        (33.9800, 71.4800, 0.12),  # Old City
        (34.0300, 71.6000, 0.08),  # Ring Road
    ]

    # Generate population points
    pop_points = []
    for lat_c, lon_c, weight in hotspots:
        n = int(num_population_points * weight)
        lats = np.random.normal(lat_c, 0.015, n)
        lons = np.random.normal(lon_c, 0.015, n)
        pops = np.random.randint(200, 3000, n)
        for i in range(n):
            pop_points.append({
                'latitude': round(float(lats[i]), 6),
                'longitude': round(float(lons[i]), 6),
                'population': int(pops[i]),
                'area_km2': 0.04,
                'source': 'synthetic'
            })

    pop_df = pd.DataFrame(pop_points)
    pop_gdf = gpd.GeoDataFrame(
        pop_df,
        geometry=[Point(r.longitude, r.latitude) for r in pop_df.itertuples()],
        crs='EPSG:4326'
    )

    # Generate buildings
    building_types = ['residential', 'commercial', 'industrial', 'mosque']
    building_weights = [0.65, 0.20, 0.10, 0.05]
    heights = {'residential': 10, 'commercial': 20, 'industrial': 12, 'mosque': 15}

    buildings = []
    for lat_c, lon_c, weight in hotspots:
        n = int(num_buildings * weight)
        for _ in range(n):
            lat = np.random.normal(lat_c, 0.012)
            lon = np.random.normal(lon_c, 0.012)
            btype = np.random.choice(building_types, p=building_weights)
            size = 0.0002
            polygon = Polygon([
                (lon, lat), (lon+size, lat),
                (lon+size, lat+size), (lon, lat+size)
            ])
            buildings.append({
                'building': btype,
                'height_m': heights[btype] + np.random.uniform(-2, 2),
                'centroid_lat': lat,
                'centroid_lon': lon,
                'footprint_area_m2': (size * 111000) ** 2,
                'geometry': polygon
            })

    bldg_gdf = gpd.GeoDataFrame(buildings, crs='EPSG:4326')

    return pop_gdf, bldg_gdf


if __name__ == "__main__":
    os.makedirs("data-pipeline/sample_data", exist_ok=True)

    print("Generating synthetic Peshawar city data...")
    pop_gdf, bldg_gdf = generate_synthetic_city(
        name="peshawar_test",
        num_population_points=5000,
        num_buildings=2000
    )

    pop_gdf.drop(columns='geometry').to_csv(
        "data-pipeline/sample_data/peshawar_test_population.csv", index=False)
    bldg_gdf.to_file(
        "data-pipeline/sample_data/peshawar_test_buildings.geojson", driver='GeoJSON')

    print(f"Population points: {len(pop_gdf)}")
    print(f"Total population: {pop_gdf['population'].sum():,}")
    print(f"Buildings: {len(bldg_gdf)}")
    print("Saved to sample_data/ ✔")