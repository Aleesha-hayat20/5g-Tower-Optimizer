import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, Polygon
import os

# ✅ NEW: city config registry — add any city here
CITY_CONFIGS = {
    "peshawar": {
        "center_lat": 34.0151, "center_lng": 71.5249,
        "hotspots": [
            (34.0151, 71.5249, 0.35),   # Saddar
            (34.0050, 71.5350, 0.25),   # University Town
            (34.0200, 71.5800, 0.20),   # Hayatabad
            (33.9800, 71.4800, 0.12),   # Old City
            (34.0300, 71.6000, 0.08),   # Ring Road
        ],
    },
    "karachi": {
        "center_lat": 24.8607, "center_lng": 67.0011,
        "hotspots": [
            (24.8607, 67.0011, 0.30),   # City Centre / Saddar
            (24.9056, 67.0822, 0.25),   # Gulshan-e-Iqbal
            (24.8200, 67.0300, 0.20),   # Clifton / Defence
            (24.9400, 67.0600, 0.15),   # North Nazimabad
            (24.8800, 66.9900, 0.10),   # SITE Industrial Area
        ],
    },
    "lahore": {
        "center_lat": 31.5497, "center_lng": 74.3436,
        "hotspots": [
            (31.5497, 74.3436, 0.30),   # City Centre / Mall Road
            (31.4900, 74.3200, 0.25),   # DHA / Cantt
            (31.5800, 74.3600, 0.20),   # Gulberg
            (31.5200, 74.4000, 0.15),   # Johar Town
            (31.6100, 74.3100, 0.10),   # Shalamar / Wagah
        ],
    },
    "islamabad": {
        "center_lat": 33.6844, "center_lng": 73.0479,
        "hotspots": [
            (33.7294, 73.0931, 0.30),   # F-6 / Blue Area
            (33.6844, 73.0479, 0.25),   # G-10 / G-11
            (33.7500, 73.0700, 0.20),   # F-8 / F-10
            (33.6600, 73.1000, 0.15),   # I-8 / I-10
            (33.7000, 73.0200, 0.10),   # Rawalpindi border area
        ],
    },
}


def generate_synthetic_city(
    name="peshawar",
    num_population_points=5000,
    num_buildings=2000,
    seed=42
):
    """
    Generate realistic synthetic city data for any configured city.
    Supports: peshawar, karachi, lahore, islamabad
    """
    np.random.seed(seed)

    config = CITY_CONFIGS.get(name)
    if config is None:
        raise ValueError(f"Unknown city '{name}'. Available: {list(CITY_CONFIGS.keys())}")

    hotspots = config["hotspots"]

    # Generate population points
    pop_points = []
    for lat_c, lon_c, weight in hotspots:
        n = int(num_population_points * weight)
        spread = 0.018 if name == "karachi" else 0.015   # Karachi is more spread out
        lats = np.random.normal(lat_c, spread, n)
        lons = np.random.normal(lon_c, spread, n)
        pops = np.random.randint(200, 3000, n)
        for i in range(n):
            pop_points.append({
                'latitude':  round(float(lats[i]), 6),
                'longitude': round(float(lons[i]), 6),
                'population': int(pops[i]),
                'area_km2': 0.04,
                'source': 'synthetic',
                'city': name,
            })

    pop_df = pd.DataFrame(pop_points)
    pop_gdf = gpd.GeoDataFrame(
        pop_df,
        geometry=[Point(r.longitude, r.latitude) for r in pop_df.itertuples()],
        crs='EPSG:4326'
    )

    # Generate buildings
    building_types   = ['residential', 'commercial', 'industrial', 'mosque']
    building_weights = [0.65, 0.20, 0.10, 0.05]
    heights = {'residential': 10, 'commercial': 20, 'industrial': 12, 'mosque': 15}

    buildings = []
    for lat_c, lon_c, weight in hotspots:
        n = int(num_buildings * weight)
        for _ in range(n):
            lat   = np.random.normal(lat_c, 0.012)
            lon   = np.random.normal(lon_c, 0.012)
            btype = np.random.choice(building_types, p=building_weights)
            size  = 0.0002
            polygon = Polygon([
                (lon, lat), (lon + size, lat),
                (lon + size, lat + size), (lon, lat + size)
            ])
            buildings.append({
                'building':         btype,
                'height_m':         heights[btype] + np.random.uniform(-2, 2),
                'centroid_lat':     lat,
                'centroid_lon':     lon,
                'footprint_area_m2': (size * 111000) ** 2,
                'city':             name,
                'geometry':         polygon,
            })

    bldg_gdf = gpd.GeoDataFrame(buildings, crs='EPSG:4326')

    return pop_gdf, bldg_gdf


if __name__ == "__main__":
    os.makedirs("data_pipeline/sample_data", exist_ok=True)

    # ✅ Generate all 4 cities
    cities = ["peshawar", "karachi", "lahore", "islamabad"]

    for city in cities:
        print(f"\nGenerating synthetic data for {city.title()}...")
        pop_gdf, bldg_gdf = generate_synthetic_city(
            name=city,
            num_population_points=5000,
            num_buildings=2000,
        )
        pop_gdf.drop(columns='geometry').to_csv(
            f"data_pipeline/sample_data/{city}_test_population.csv", index=False)
        bldg_gdf.to_file(
            f"data_pipeline/sample_data/{city}_test_buildings.geojson", driver='GeoJSON')

        print(f"  Population points : {len(pop_gdf)}")
        print(f"  Total population  : {pop_gdf['population'].sum():,}")
        print(f"  Buildings         : {len(bldg_gdf)}")
        print(f"  Saved to sample_data/{city}_test_*.* ✔")
