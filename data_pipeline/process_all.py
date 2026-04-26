import sys
import os
import pandas as pd
import geopandas as gpd
import pickle
from shapely.geometry import Point

# Add root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_pipeline.preprocessing.grid_builder import build_population_grid

def process_city(city_name):
    print(f"\nProcessing {city_name.upper()}...")
    try:
        pop_file = f"data_pipeline/sample_data/{city_name}_test_population.csv"
        bld_file = f"data_pipeline/sample_data/{city_name}_test_buildings.geojson"
        
        if not os.path.exists(pop_file) or not os.path.exists(bld_file):
            print(f"Skipping {city_name}: Files not found.")
            return

        df = pd.read_csv(pop_file)
        pop_gdf = gpd.GeoDataFrame(
            df,
            geometry=[Point(row.longitude, row.latitude) for row in df.itertuples()],
            crs="EPSG:4326"
        )
        buildings_gdf = gpd.read_file(bld_file)

        grid = build_population_grid(pop_gdf, buildings_gdf, resolution_m=200)

        os.makedirs("data_pipeline/processed", exist_ok=True)
        out_file = f"data_pipeline/processed/{city_name}_grid.pkl"
        with open(out_file, "wb") as f:
            pickle.dump(grid, f)
        print(f"Grid saved to {out_file} ✔")
    except Exception as e:
        print(f"Error processing {city_name}: {e}")

if __name__ == "__main__":
    cities = ["islamabad", "karachi", "lahore", "peshawar"]
    for city in cities:
        process_city(city)
    print("\nAll processing complete!")
