import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import os

def load_population(filepath: str) -> gpd.GeoDataFrame:
    """
    Load population density data from CSV or GeoJSON.

    Expected CSV columns:
        - latitude (float)
        - longitude (float)
        - population (int)
        - area_km2 (float, optional)

    Returns:
        GeoDataFrame with Point geometry and population column
    """
    ext = os.path.splitext(filepath)[1].lower()

    if ext == '.csv':
        df = pd.read_csv(filepath)

        # Handle different column name variants
        df.columns = df.columns.str.strip().str.lower()
        if 'population_count' in df.columns:
            df = df.rename(columns={'population_count': 'population'})
        if 'lat' in df.columns:
            df = df.rename(columns={'lat': 'latitude'})
        if 'lng' in df.columns:
            df = df.rename(columns={'lng': 'longitude'})
        if 'lon' in df.columns:
            df = df.rename(columns={'lon': 'longitude'})

        # Drop rows with missing coordinates
        df = df.dropna(subset=['latitude', 'longitude'])
        df = df[df['population'] > 0]

        geometry = [Point(row.longitude, row.latitude) for row in df.itertuples()]
        gdf = gpd.GeoDataFrame(df, geometry=geometry, crs='EPSG:4326')

    elif ext in ['.geojson', '.gpkg', '.shp']:
        gdf = gpd.read_file(filepath)
        if gdf.crs is None:
            gdf = gdf.set_crs('EPSG:4326')
        else:
            gdf = gdf.to_crs('EPSG:4326')

    else:
        raise ValueError(f"Unsupported file format: {ext}")

    print(f"Loaded {len(gdf)} population points")
    print(f"Total population: {gdf['population'].sum():,}")
    return gdf


if __name__ == "__main__":
    # Test with our real Peshawar population data
    import rasterio
    from rasterio.mask import mask
    import numpy as np

    print("Converting Peshawar population raster to CSV first...")

    boundary = gpd.read_file("data/raw/boundary/peshawar_boundary.geojson")

    with rasterio.open("data/raw/population/pak_ppp_2020_1km_Aggregated_UNadj.tif") as src:
        boundary = boundary.to_crs(src.crs)
        shapes = [geom.__geo_interface__ for geom in boundary.geometry]
        cropped, transform = mask(src, shapes, crop=True)
        cropped = cropped[0]

    rows, cols = np.where(cropped > 0)
    populations = cropped[rows, cols]
    lons, lats = rasterio.transform.xy(transform, rows, cols)

    df = pd.DataFrame({
        'latitude': lats,
        'longitude': lons,
        'population': populations.astype(int)
    })
    df = df[df['population'] > 0]

    os.makedirs("data_pipeline/sample_data", exist_ok=True)
    df.to_csv("data_pipeline/sample_data/peshawar_population.csv", index=False)
    print(f"Saved {len(df)} rows to sample_data/peshawar_population.csv ✔")

    # Now test the loader
    gdf = load_population("data_pipeline/sample_data/peshawar_population.csv")
    print(gdf.head())