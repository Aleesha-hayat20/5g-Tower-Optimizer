import numpy as np


def normalize_coordinates(lat, lng, bounds):
    """
    Normalize lat/lng to [0, 1] range for GA.
    """
    norm_lat = (lat - bounds['lat_min']) / (bounds['lat_max'] - bounds['lat_min'])
    norm_lng = (lng - bounds['lng_min']) / (bounds['lng_max'] - bounds['lng_min'])
    return norm_lat, norm_lng


def denormalize_coordinates(norm_lat, norm_lng, bounds):
    """Reverse normalization back to lat/lng."""
    lat = norm_lat * (bounds['lat_max'] - bounds['lat_min']) + bounds['lat_min']
    lng = norm_lng * (bounds['lng_max'] - bounds['lng_min']) + bounds['lng_min']
    return lat, lng


def latlng_to_meters(lat1, lng1, lat2, lng2):
    """Haversine distance between two points in meters."""
    R = 6371000
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lng2 - lng1)
    a = np.sin(dphi/2)**2 + np.cos(phi1)*np.cos(phi2)*np.sin(dlambda/2)**2
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


def get_bounds(gdf):
    """Extract bounding box from a GeoDataFrame."""
    return {
        'lat_min': float(gdf.geometry.y.min()),
        'lat_max': float(gdf.geometry.y.max()),
        'lng_min': float(gdf.geometry.x.min()),
        'lng_max': float(gdf.geometry.x.max()),
    }


if __name__ == "__main__":
    import geopandas as gpd
    import pandas as pd
    from shapely.geometry import Point

    print("Testing normalize.py...")

    df = pd.read_csv("data_pipeline/sample_data/peshawar_population.csv")
    gdf = gpd.GeoDataFrame(
        df, geometry=[Point(r.longitude, r.latitude) for r in df.itertuples()],
        crs='EPSG:4326'
    )

    bounds = get_bounds(gdf)
    print(f"Bounds: {bounds}")

    norm_lat, norm_lng = normalize_coordinates(
        df['latitude'].values, df['longitude'].values, bounds
    )
    print(f"Normalized lat range: {norm_lat.min():.3f} to {norm_lat.max():.3f}")
    print(f"Normalized lng range: {norm_lng.min():.3f} to {norm_lng.max():.3f}")

    lat_back, lng_back = denormalize_coordinates(norm_lat, norm_lng, bounds)
    print(f"Denormalized lat sample: {lat_back[0]:.6f} (original: {df['latitude'].iloc[0]:.6f})")

    dist = latlng_to_meters(34.0151, 71.5249, 34.0200, 71.5300)
    print(f"Distance test: {dist:.1f} meters")
    print("normalize.py working ✔")