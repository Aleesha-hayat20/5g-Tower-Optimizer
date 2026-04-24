"""
tests/test_all.py
-----------------
Run with:  pytest tests/test_all.py -v
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import numpy as np
import pandas as pd
import geopandas as gpd
import pytest
from shapely.geometry import Point, Polygon

from data_pipeline.preprocessing.normalize import (
    normalize_coordinates, denormalize_coordinates,
    latlng_to_meters, get_bounds
)
from data_pipeline.preprocessing.validate import DataValidator
from data_pipeline.signal.propagation import SignalModel, haversine
from data_pipeline.signal.coverage_scorer import CoverageScorer
from data_pipeline.preprocessing.grid_structure import PopulationGrid


# ─── Fixtures ──────────────────────────────────────────────────────────────

@pytest.fixture
def sample_bounds():
    return {'lat_min': 33.9, 'lat_max': 34.1, 'lng_min': 71.4, 'lng_max': 71.7}

@pytest.fixture
def sample_pop_gdf():
    df = pd.DataFrame({
        'latitude':   [34.01, 34.02, 34.03],
        'longitude':  [71.52, 71.53, 71.54],
        'population': [100, 200, 300],
    })
    return gpd.GeoDataFrame(
        df,
        geometry=[Point(r.longitude, r.latitude) for r in df.itertuples()],
        crs='EPSG:4326'
    )

@pytest.fixture
def sample_bldg_gdf():
    polys = [Polygon([(71.52, 34.01), (71.521, 34.01), (71.521, 34.011), (71.52, 34.011)])]
    return gpd.GeoDataFrame({'building': ['residential'], 'height_m': [10.0]},
                             geometry=polys, crs='EPSG:4326')

@pytest.fixture
def mock_grid():
    cells = np.array([
        [34.01, 71.52, 100.0, 0.2],
        [34.02, 71.53, 200.0, 0.3],
        [34.03, 71.54, 300.0, 0.1],
    ])
    return PopulationGrid(
        cells=cells, bounds={'lat_min': 33.9, 'lat_max': 34.1,
                             'lng_min': 71.4, 'lng_max': 71.7},
        resolution_m=200.0, total_population=600, total_cells=3,
        metadata={}
    )

@pytest.fixture
def signal_model():
    return SignalModel(frequency_ghz=3.5, noise_floor_dbm=-95)


# ─── normalize.py ──────────────────────────────────────────────────────────

class TestNormalize:
    def test_normalize_range(self, sample_bounds):
        norm_lat, norm_lng = normalize_coordinates(34.0, 71.5, sample_bounds)
        assert 0.0 <= norm_lat <= 1.0
        assert 0.0 <= norm_lng <= 1.0

    def test_roundtrip(self, sample_bounds):
        lat, lng = 34.02, 71.55
        n_lat, n_lng = normalize_coordinates(lat, lng, sample_bounds)
        lat2, lng2 = denormalize_coordinates(n_lat, n_lng, sample_bounds)
        assert abs(lat2 - lat) < 1e-9
        assert abs(lng2 - lng) < 1e-9

    def test_boundary_values(self, sample_bounds):
        n_lat, n_lng = normalize_coordinates(
            sample_bounds['lat_min'], sample_bounds['lng_min'], sample_bounds)
        assert abs(n_lat) < 1e-9
        assert abs(n_lng) < 1e-9

        n_lat, n_lng = normalize_coordinates(
            sample_bounds['lat_max'], sample_bounds['lng_max'], sample_bounds)
        assert abs(n_lat - 1.0) < 1e-9
        assert abs(n_lng - 1.0) < 1e-9

    def test_haversine_known_distance(self):
        # Peshawar center to ~1km east — expect ~800-1000m
        d = latlng_to_meters(34.0151, 71.5249, 34.0151, 71.5340)
        assert 700 < d < 1100

    def test_haversine_zero(self):
        d = latlng_to_meters(34.0, 71.5, 34.0, 71.5)
        assert d < 1.0

    def test_get_bounds(self, sample_pop_gdf):
        bounds = get_bounds(sample_pop_gdf)
        assert bounds['lat_min'] < bounds['lat_max']
        assert bounds['lng_min'] < bounds['lng_max']


# ─── validate.py ───────────────────────────────────────────────────────────

class TestValidator:
    def test_valid_population(self, sample_pop_gdf):
        v = DataValidator()
        r = v.validate_population(sample_pop_gdf)
        assert r.is_valid
        assert r.errors == []

    def test_negative_population(self):
        df = pd.DataFrame({'latitude': [34.0], 'longitude': [71.5], 'population': [-5]})
        gdf = gpd.GeoDataFrame(df, geometry=[Point(71.5, 34.0)], crs='EPSG:4326')
        r = DataValidator().validate_population(gdf)
        assert not r.is_valid
        assert any('negative' in e for e in r.errors)

    def test_spatial_alignment_good(self, sample_pop_gdf, sample_bldg_gdf):
        v = DataValidator()
        result = v.check_spatial_alignment(sample_pop_gdf, sample_bldg_gdf)
        assert 'overlap_percent' in result
        assert result['overlap_percent'] >= 0

    def test_valid_buildings(self, sample_bldg_gdf):
        v = DataValidator()
        r = v.validate_buildings(sample_bldg_gdf)
        assert isinstance(r.is_valid, bool)


# ─── propagation.py ────────────────────────────────────────────────────────

class TestSignalModel:
    def test_fspl_increases_with_distance(self, signal_model):
        fspl_100  = signal_model.free_space_path_loss(100)
        fspl_1000 = signal_model.free_space_path_loss(1000)
        assert fspl_1000 > fspl_100

    def test_fspl_decade_rule(self, signal_model):
        """FSPL should increase by ~20dB per decade of distance."""
        diff = signal_model.free_space_path_loss(1000) - signal_model.free_space_path_loss(100)
        assert 19.0 < diff < 21.0

    def test_fspl_zero_distance_clamped(self, signal_model):
        """Should not raise — distance clamped to 1m."""
        result = signal_model.free_space_path_loss(0)
        assert np.isfinite(result)

    def test_building_attenuation_increases_with_density(self, signal_model):
        a_low  = signal_model.building_attenuation(500, 0.1)
        a_high = signal_model.building_attenuation(500, 0.9)
        assert a_high > a_low

    def test_building_attenuation_zero_density(self, signal_model):
        a = signal_model.building_attenuation(500, 0.0)
        assert a == 0.0

    def test_snr_decreases_with_distance(self, signal_model):
        snr_near = signal_model.calculate_snr(
            tx_power_dbm=30, tx_height_m=30,
            rx_lat=34.015, rx_lng=71.525,
            tower_lat=34.016, tower_lng=71.525,
            building_density=0.0
        )
        snr_far = signal_model.calculate_snr(
            tx_power_dbm=30, tx_height_m=30,
            rx_lat=34.015, rx_lng=71.525,
            tower_lat=34.050, tower_lng=71.525,
            building_density=0.0
        )
        assert snr_near > snr_far

    def test_haversine_symmetry(self):
        d1 = haversine(34.0, 71.5, 34.1, 71.6)
        d2 = haversine(34.1, 71.6, 34.0, 71.5)
        assert abs(d1 - d2) < 0.001


# ─── coverage_scorer.py ────────────────────────────────────────────────────

class TestCoverageScorer:
    def test_single_tower_returns_expected_keys(self, signal_model, mock_grid):
        scorer = CoverageScorer(signal_model, min_snr_db=-70)
        tower = {'lat': 34.02, 'lng': 71.53, 'height_m': 30, 'power_dbm': 30}
        result = scorer.calculate_tower_coverage(tower, mock_grid)
        for key in ['covered_population', 'coverage_percent', 'avg_snr_db',
                    'coverage_radius_m', 'snr_map']:
            assert key in result

    def test_coverage_percent_between_0_and_100(self, signal_model, mock_grid):
        scorer = CoverageScorer(signal_model, min_snr_db=-70)
        tower = {'lat': 34.02, 'lng': 71.53, 'height_m': 30, 'power_dbm': 30}
        result = scorer.calculate_tower_coverage(tower, mock_grid)
        assert 0.0 <= result['coverage_percent'] <= 100.0

    def test_multi_tower_not_less_than_single(self, signal_model, mock_grid):
        scorer = CoverageScorer(signal_model, min_snr_db=-70)
        tower1 = {'lat': 34.01, 'lng': 71.52, 'height_m': 30, 'power_dbm': 30}
        tower2 = {'lat': 34.03, 'lng': 71.54, 'height_m': 30, 'power_dbm': 30}
        single = scorer.calculate_tower_coverage(tower1, mock_grid)
        multi  = scorer.calculate_total_coverage([tower1, tower2], mock_grid)
        assert multi['coverage_percent'] >= single['coverage_percent']

    def test_interference_zero_for_single_tower(self, signal_model, mock_grid):
        scorer = CoverageScorer(signal_model, min_snr_db=-70)
        towers = [{'lat': 34.02, 'lng': 71.53, 'height_m': 30, 'power_dbm': 30}]
        result = scorer.calculate_total_coverage(towers, mock_grid)
        assert result['interference_score'] == 0.0

    def test_covered_population_not_exceed_total(self, signal_model, mock_grid):
        scorer = CoverageScorer(signal_model, min_snr_db=-70)
        tower = {'lat': 34.02, 'lng': 71.53, 'height_m': 30, 'power_dbm': 30}
        result = scorer.calculate_tower_coverage(tower, mock_grid)
        assert result['covered_population'] <= mock_grid.total_population
