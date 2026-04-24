import geopandas as gpd
import pandas as pd
import numpy as np
import os


def estimate_building_height(gdf):
    def get_height(row):
        try:
            h = float(row.get('height', 0) or 0)
            if h > 0:
                return h
        except (ValueError, TypeError):
            pass
        levels = row.get('building:levels', None)
        if levels is not None:
            try:
                return float(levels) * 3.5
            except:
                pass
        building_type = str(row.get('building', '')).lower()
        if building_type in ['residential', 'house', 'apartments']:
            return np.random.uniform(8, 12)
        elif building_type in ['commercial', 'retail', 'office']:
            return np.random.uniform(15, 25)
        elif building_type in ['industrial', 'warehouse']:
            return np.random.uniform(10, 15)
        elif building_type in ['mosque', 'religious']:
            return np.random.uniform(10, 20)
        else:
            return 10.0
    gdf['height_m'] = gdf.apply(get_height, axis=1)
    return gdf


def load_buildings(filepath):
    print(f"Loading buildings from {filepath}...")
    gdf = gpd.read_file(filepath)
    if gdf.crs is None:
        gdf = gdf.set_crs('EPSG:4326')
    else:
        gdf = gdf.to_crs('EPSG:4326')
    print(f"Total buildings loaded: {len(gdf)}")
    gdf = estimate_building_height(gdf)
    gdf['centroid_lat'] = gdf.geometry.centroid.y
    gdf['centroid_lon'] = gdf.geometry.centroid.x
    gdf_projected = gdf.to_crs('EPSG:32642')
    gdf['footprint_area_m2'] = gdf_projected.geometry.area
    def get_material(building_type):
        building_type = str(building_type).lower()
        if building_type in ['commercial', 'office', 'retail']:
            return 'glass'
        elif building_type in ['industrial', 'warehouse']:
            return 'concrete'
        elif building_type in ['residential', 'house']:
            return 'wood'
        else:
            return 'concrete'
    building_col = 'building' if 'building' in gdf.columns else None
    if building_col:
        gdf['material_type'] = gdf[building_col].apply(get_material)
    else:
        gdf['material_type'] = 'concrete'
    attenuation_map = {'concrete': 20, 'glass': 12, 'wood': 6, 'none': 0}
    gdf['attenuation_db'] = gdf['material_type'].map(attenuation_map)
    keep_cols = ['centroid_lat', 'centroid_lon', 'height_m',
                 'material_type', 'attenuation_db', 'footprint_area_m2', 'geometry']
    gdf = gdf[[c for c in keep_cols if c in gdf.columns]]
    print(f"Buildings processed: {len(gdf)}")
    print(f"Average height: {gdf['height_m'].mean():.1f}m")
    return gdf


if __name__ == "__main__":
    gdf = load_buildings("data/raw/buildings/buildings_peshawar.geojson")
    print(gdf.head())
    os.makedirs("data-pipeline/sample_data", exist_ok=True)
    gdf.drop(columns='geometry').to_csv(
        "data-pipeline/sample_data/peshawar_buildings.csv", index=False)
    print("Saved to sample_data/peshawar_buildings.csv")