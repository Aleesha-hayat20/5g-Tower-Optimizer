# 5G Tower Placement Optimizer — Backend Optimization Branch (`feature-backend-optimization`)

## Overview

This branch contains the complete backend computational engine and API service for the **5G Tower Placement Optimizer** project.

The project objective is to intelligently determine optimal 5G tower placements in a city by combining:

- population density,
- building obstruction density,
- wireless signal propagation,
- coverage scoring,
- hotspot clustering,
- and evolutionary optimization.

This backend consumes the preprocessed city grid artifacts generated in the `feature-data-preprocessing` stage and transforms them into an executable optimization service exposed through FastAPI endpoints.

---

# Backend Scope Completed in this Branch

The following backend systems were fully designed and implemented in `feature-backend-optimization`:

- Weighted K-Means hotspot clustering engine
- Multi-objective Genetic Algorithm tower optimizer
- Telecom fitness evaluation using real SNR/coverage/interference metrics
- FastAPI web backend service
- Optimization result caching and retrieval
- Celery asynchronous worker scaffold
- Automated backend smoke/integration tests
- Full integration with teammate preprocessing outputs (`PopulationGrid`, `SignalModel`, `CoverageScorer`)

---

# Full Repository Architecture

```bash
5g-Tower-Optimizer/
│
├── backend/                        # COMPLETE backend service implemented in this branch
│   ├── api/
│   │   ├── routes/
│   │   │   ├── cluster.py
│   │   │   ├── optimize.py
│   │   │   └── results.py
│   │   └── schemas.py
│   │
│   ├── core/
│   │   ├── cache_manager.py
│   │   ├── config.py
│   │   ├── fitness.py
│   │   ├── genetic_algorithm.py
│   │   ├── kmeans.py
│   │   └── result_formatter.py
│   │
│   ├── tasks/
│   │   └── celery_worker.py
│   │
│   ├── tests/
│   │   ├── test_ga.py
│   │   ├── test_kmeans.py
│   │   └── test_signal.py
│   │
│   ├── results_cache/
│   ├── requirements.txt
│   └── main.py
│
├── data_pipeline/                 # teammate preprocessing stage
│   ├── preprocessing/
│   ├── signal/
│   ├── processed/
│   └── sample_data/
│
└── frontend/                      # frontend integration pending