# Genetron Optimizer (Data Pipeline)
### Laiba Afridi - Data Pipeline & Signal Propagation Modeling

This repository contains the data infrastructure for the **Genetron** system. It handles spatial data ingestion, preprocessing, population grid construction, and signal propagation modeling — feeding clean, structured data directly into the GA optimization engine.

---

## 🛠️ Key Responsibilities

- **Data Ingestion**: Loading real population data (WorldPop) and building footprints (OpenStreetMap) for Peshawar and other Pakistani cities.
- **Synthetic Data Generation**: Generating realistic city data for testing when real data is unavailable.
- **Spatial Preprocessing**: Coordinate normalization, input validation, and 200m population grid construction.
- **Signal Propagation Model**: Implementing FSPL + building attenuation model to estimate 5G signal coverage.
- **Coverage Scoring**: Evaluating tower configurations against weighted population coverage for the GA fitness function.

---

## 🚀 Data Pipeline Tech Stack

- **Spatial Processing**: GeoPandas, Shapely, PyProj
- **Raster Processing**: Rasterio (WorldPop GeoTIFF ingestion)
- **OSM Data**: OSMnx (building footprint extraction)
- **Numerical Processing**: NumPy, SciPy (signal math & grid building)
- **Data Formats**: CSV, GeoJSON, Pickle (.pkl)

---

## 📂 Pipeline Structure

```text
data_pipeline/
├── ingestion/
│   ├── load_population.py     ← Loads population CSV/GeoJSON/TIF
│   ├── load_buildings.py      ← Loads OSM building footprints
│   └── synthetic_city.py      ← Generates synthetic city data
│
├── preprocessing/
│   ├── normalize.py           ← Coordinate normalization & haversine distance
│   ├── validate.py            ← Input validation & edge case handling
│   ├── grid_builder.py        ← Converts raw points → 200m population grid
│   └── grid_structure.py      ← PopulationGrid dataclass
│
├── signal/
│   ├── propagation.py         ← FSPL + building attenuation model
│   └── coverage_scorer.py     ← Scores tower configs against population
│
├── sample_data/               ← Test datasets (Peshawar, Karachi, Lahore, Islamabad)
├── processed/                 ← Pre-computed grids (.pkl) for GA optimizer
└── notebooks/                 ← EDA & signal model validation
```

---

## 📡 Signal Model
| Material | Attenuation |
|----------|-------------|
| Concrete | 20 dB |
| Glass/Steel | 12 dB |
| Wood/Residential | 6 dB |
| Open terrain | 0 dB |

A user is covered if P_rx ≥ -100 dBm.

---

## 📝 Setup

```bash
pip install -r requirements.txt

# Extract Peshawar boundary
python scripts/extract_peshawar.py

# Run full pipeline
python data_pipeline/ingestion/load_population.py
python data_pipeline/ingestion/load_buildings.py
python data_pipeline/ingestion/synthetic_city.py
python data_pipeline/preprocessing/grid_builder.py

# Run tests
pytest tests/test_all.py
```

---

## 🔗 Integration with GA Engine

```python
# Aleesha's optimizer loads these directly
from data_pipeline.signal.propagation import SignalModel
from data_pipeline.signal.coverage_scorer import CoverageScorer
import pickle

grid = pickle.load(open("data_pipeline/processed/peshawar_grid.pkl", "rb"))
```

---

**Author**: Laiba Afridi (23I-6035)
**Project**: End-of-Semester AI Project / Spring 2026
