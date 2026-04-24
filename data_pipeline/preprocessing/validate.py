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


if __name__ == "__main__":
    import pandas as pd
    from shapely.geometry import Point

    print("Testing validate.py...")

    # Load population sample
    df = pd.read_csv("data_pipeline/sample_data/peshawar_population.csv")
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