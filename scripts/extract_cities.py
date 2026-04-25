"""
extract_cities.py
-----------------
Extracts population raster data for Lahore and Islamabad
using their admin boundaries (same approach as extract_peshawar.py).

Usage:
    python scripts/extract_cities.py

Requirements:
    - data/raw/boundary/pak_admin3.geojson  (Pakistan admin boundaries)
    - data/raw/population/pak_ppp_2020_1km_Aggregated_UNadj.tif
"""

import os
import sys
import numpy as np
import pandas as pd
import geopandas as gpd
import rasterio
from rasterio.mask import mask

# Map city name → district name in pak_admin3.geojson
# Adjust these if your boundary file uses different name spellings
CITY_DISTRICT_MAP = {
    "lahore":     "Lahore",
    "islamabad":  "Islamabad",
    "peshawar":   "Peshawar",
    "karachi":    "Karachi",    # bonus
}

RASTER_PATH   = "data/raw/population/pak_ppp_2020_1km_Aggregated_UNadj.tif"
BOUNDARY_PATH = "data/raw/boundary/pak_admin3.geojson"
OUTPUT_DIR    = "data_pipeline/sample_data"


def extract_city_population(city_name: str, district_name: str) -> pd.DataFrame:
    print(f"\nExtracting population for {city_name.title()} (district: {district_name})...")

    admin = gpd.read_file(BOUNDARY_PATH)

    # Try common name columns
    name_col = None
    for col in ['NAME_3', 'NAME_2', 'name', 'DISTRICT', 'district']:
        if col in admin.columns:
            name_col = col
            break
    if name_col is None:
        raise ValueError(f"Cannot find a name column in {BOUNDARY_PATH}. Columns: {list(admin.columns)}")

    boundary = admin[admin[name_col].str.lower() == district_name.lower()]
    if len(boundary) == 0:
        # Fallback: partial match
        boundary = admin[admin[name_col].str.lower().str.contains(district_name.lower())]
    if len(boundary) == 0:
        raise ValueError(
            f"District '{district_name}' not found in boundary file.\n"
            f"Available (sample): {admin[name_col].unique()[:20]}"
        )

    print(f"  Boundary rows matched: {len(boundary)}")

    with rasterio.open(RASTER_PATH) as src:
        boundary_proj = boundary.to_crs(src.crs)
        shapes = [geom.__geo_interface__ for geom in boundary_proj.geometry]
        cropped, transform = mask(src, shapes, crop=True)
        cropped = cropped[0]

    rows, cols = np.where(cropped > 0)
    populations = cropped[rows, cols]
    lons, lats = rasterio.transform.xy(transform, rows, cols)

    df = pd.DataFrame({
        'latitude':   lats,
        'longitude':  lons,
        'population': populations.astype(int),
        'city':       city_name,
    })
    df = df[df['population'] > 0]

    print(f"  Extracted {len(df):,} grid cells")
    print(f"  Total population: {df['population'].sum():,}")
    return df


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    cities_to_extract = ["lahore", "islamabad"]

    for city in cities_to_extract:
        district = CITY_DISTRICT_MAP[city]
        try:
            df = extract_city_population(city, district)
            out_path = os.path.join(OUTPUT_DIR, f"{city}_population.csv")
            df.to_csv(out_path, index=False)
            print(f"  Saved to {out_path} ✔")
        except Exception as e:
            print(f"  ERROR for {city}: {e}")
            print(f"  → Falling back to synthetic data for {city}")


if __name__ == "__main__":
    main()
