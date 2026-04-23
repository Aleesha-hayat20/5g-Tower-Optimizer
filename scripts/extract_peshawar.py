import geopandas as gpd
import os

# 1. Setup paths
input_file = "data/raw/boundary/pak_admin3.geojson" # Check your unzipped filename!
output_file = "data/raw/boundary/peshawar_boundary.geojson"

# 2. Load the big Pakistan file
print("Loading Pakistan boundaries...")
pak = gpd.read_file(input_file)

# 3. Filter for Peshawar (District name is usually ADM2_EN or similar)
# We search for 'Peshawar' in the administrative name columns
peshawar = pak[pak['adm2_name'] == 'Peshawar']

# 4. Save only Peshawar
peshawar.to_file(output_file, driver='GeoJSON')
print(f"Success! Peshawar boundary saved to {output_file} ✔")