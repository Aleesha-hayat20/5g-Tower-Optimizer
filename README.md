# 5G-Tower-Optimizer
### End-of-Semester_AI_Project/Spring26: The 5G Tower Placement Optimizer

**SignalProphet V2.4** (Integrated Engine: **GENETRON**) is a spatial AI and optimization platform designed to solve the telecom placement paradox. It leverages multi-objective Genetic Algorithms (NSGA-II) and high-fidelity spectral modeling to determine the mathematically optimal locations for 5G base stations in dense urban environments.

---

## 🚀 Key Features
- **NSGA-II Solver Core**: Simultaneously optimizes for maximum coverage, minimum interference, and optimized cost per tower.
- **Vectorized Propagation Engine**: High-speed SNR matrix calculations using vectorized signal propagation models (Path Loss + Urban Diffraction).
- **Interactive Spatial Visualization**: Real-time rendering of tower clusters and spectral intensity heatmaps using React & D3.
- **OSM Data Synthesis**: Directly ingests OpenStreetMap building geometries to model realistic signal shadows and diffraction patterns.
- **Comparative Analysis**: Dynamic side-by-side comparison of different optimization scenarios (e.g., Coverage Focus vs. Cost Efficiency).

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: FastAPI (Python), Uvicorn.
- **Optimization Engine**: NumPy (Vectorized Math), Genetic Algorithm (Tournament Selection + Elitism).
- **Data Pipeline**: Python (Pandas, GeoPandas, Pickle).

---

## 📂 Project Structure
```text
5g-tower-optimizer-revamped/
├── backend/                # FastAPI Server & GA Solver Core
│   ├── api/                # API Routes & Schemas
│   └── core/               # Genetic Algorithm & Fitness Logic
├── frontend/               # React Dashboard & Visualization UI
│   ├── src/                # Components, Pages, and Assets
│   └── public/             # Static Assets
├── data_pipeline/          # Signal propagation & OSM processing
│   ├── signal/             # Coverage & SNR scoring models
│   └── processed/          # Pre-computed urban grids (Peshawar, etc.)
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧑‍💻 The Team
- **Aleesha**: Backend Architecture & API Integration.
- **Taha**: Frontend Lead & Visualization Specialist.
- **Laiba**: Data Pipeline & Signal Propagation Modeling.

---

## 📝 License
This project was developed for the **Spring 2026 End-of-Semester AI Project**. Proprietary Simulation Environment.
