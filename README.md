# Genetron Optimizer (Backend Core)
### Aleesha Syeda Hayat - Backend Architecture & API Integration

This repository contains the backend infrastructure for the **Genetron** system (Engine: **GENETRON**). It handles high-performance spatial optimization using multi-objective genetic algorithms and serves a RESTful API to the frontend dashboard.

---

## 🛠️ Key Responsibilities
- **GA Optimization Engine**: Implementation of the NSGA-II algorithm for tower placement.
- **REST API (FastAPI)**: Designing endpoints for simulation triggers, progress polling, and result retrieval.
- **Fitness Evaluation**: Developing the scoring logic for signal coverage and interference.
- **Result Logic**: Sanity checking and formatting metrics for spatial rendering.

---

## 🚀 Backend Tech Stack
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Numerical Processing**: NumPy (Vectorized propagation scoring)
- **State Management**: In-memory progress tracking and result caching.

---

## 📂 Backend Structure
```text
backend/
├── api/                # API Routes, Schemas, and Controllers
│   ├── routes/         # Endpoint definitions (optimize, history, etc.)
│   └── schemas/        # Pydantic models for request/response
├── core/               # Optimization Engine Logic
│   ├── genetic_algorithm.py  # Core NSGA-II Solver
│   ├── fitness.py            # Objective functions
│   └── config.py             # Hyperparameters (Population, Mutate Rate)
└── main.py             # Entry point
```

---

## 📝 Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

---
**Author**: Aleesha Syeda Hayat  
**Project**: End-of-Semester AI Project / Spring 2026
