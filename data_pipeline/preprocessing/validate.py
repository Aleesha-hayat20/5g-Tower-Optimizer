import geopandas as gpd
import numpy as np
from dataclasses import dataclass


@dataclass
class ValidationResult:
    is_valid: bool
    errors: list
    warnings: list
    stats: dict


class DataValidator:

    def validate_population(self, gdf: gpd.GeoDataFrame) -> ValidationResult:
        errors = []
        warnings = []

        # Missing coordinates
        missing_coords = gdf[gdf.geometry.is_empty]
        if len(missing_coords) > 0:
            errors.append(f"{len(missing_coords)} rows have missing geometry")

        # Negative population
        if 'population' in gdf.columns:
            negative_pop = gdf[gdf['population'] < 0]
            if len(negative_pop) > 0:
                errors.append(f"{len(negative_pop)} rows have negative population")

        # Duplicate points
        duplicates = gdf.duplicated(subset=['geometry'])
        if duplicates.sum() > 0:
            warnings.append(f"{duplicates.sum()} duplicate points found")

        stats = {
            "total_points": len(gdf),
            "missing": len(missing_coords),
            "duplicates": int(duplicates.sum())
        }

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            stats=stats
        )

    def validate_buildings(self, gdf: gpd.GeoDataFrame) -> ValidationResult:
        errors = []
        warnings = []

        # Invalid geometries
        invalid_geom = ~gdf.is_valid
        if invalid_geom.sum() > 0:
            errors.append(f"{invalid_geom.sum()} invalid geometries found")

        # Zero area polygons
        zero_area = gdf[gdf.area == 0]
        if len(zero_area) > 0:
            warnings.append(f"{len(zero_area)} buildings have zero area")

        # Missing height
        if 'height' in gdf.columns:
            missing_height = gdf['height'].isna().sum()
            if missing_height > 0:
                warnings.append(f"{missing_height} buildings missing height")

        stats = {
            "total_buildings": len(gdf),
            "invalid": int(invalid_geom.sum()),
            "zero_area": len(zero_area)
        }

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            stats=stats
        )
def check_spatial_alignment(self, pop_gdf, bldg_gdf):
    pop_bounds = pop_gdf.total_bounds   # [minx, miny, maxx, maxy]
    bldg_bounds = bldg_gdf.total_bounds

    # Overlap calculation
    overlap_x = max(0, min(pop_bounds[2], bldg_bounds[2]) - max(pop_bounds[0], bldg_bounds[0]))
    overlap_y = max(0, min(pop_bounds[3], bldg_bounds[3]) - max(pop_bounds[1], bldg_bounds[1]))
    overlap_area = overlap_x * overlap_y

    pop_area = (pop_bounds[2] - pop_bounds[0]) * (pop_bounds[3] - pop_bounds[1])
    overlap_pct = (overlap_area / pop_area * 100) if pop_area > 0 else 0.0

    warnings = []
    if overlap_pct < 50:
        warnings.append(f"Low spatial overlap: {overlap_pct:.1f}%")

    return {
        "overlap_percent": round(overlap_pct, 2),
        "warnings": warnings
    }

if __name__ == "__main__":
    import pandas as pd
    from shapely.geometry import Point

    print("Testing validate.py...")

    # Load population sample
    df = pd.read_csv("data_pipeline/sample_data/peshawar_test_population.csv")
    pop_gdf = gpd.GeoDataFrame(
        df,
        geometry=[Point(r.longitude, r.latitude) for r in df.itertuples()],
        crs="EPSG:4326"
    )

    validator = DataValidator()

    # Test population validation
    result = validator.validate_population(pop_gdf)

    print("\nPopulation Validation:")
    print(f"Valid: {result.is_valid}")
    print(f"Errors: {result.errors}")
    print(f"Warnings: {result.warnings}")
    print(f"Stats: {result.stats}")

    print("\nvalidate.py working ✔")