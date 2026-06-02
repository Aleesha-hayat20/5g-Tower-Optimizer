# Genetron Optimizer
### End-of-Semester_AI_Project/Spring26: The 5G Tower Placement Optimizer

**Genetron** is a spatial AI and optimization platform designed to solve the telecom placement paradox. It leverages multi-objective Genetic Algorithms (NSGA-II) and high-fidelity spectral modeling to determine the mathematically optimal locations for 5G base stations in dense urban environments.

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

Below are explicit, OS-specific steps to run the backend and frontend locally.

### Backend (Python)

Windows (PowerShell):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

macOS / Linux (bash):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Alternative (run from project root):
```powershell
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Health check endpoint: http://127.0.0.1:8000/health

Notes:
- If you use environment variables, place them in `backend/.env` (project uses `python-dotenv` if present).
- `main.py` defines the FastAPI `app`; `uvicorn` is the recommended runner for development.

### Frontend (Node.js & Vite)

Prerequisite: Node.js 18+ recommended.

```powershell
cd frontend
npm install
npm run dev
```

Vite dev server default URL: http://localhost:5173

### Run tests (optional)

Make sure backend dependencies are installed and venv is active:
```powershell
cd backend
pip install -r requirements.txt
pytest -q
```

If you'd like, I can also add a short troubleshooting section or a single `scripts` block that runs backend and frontend concurrently.

---

## 🧑‍💻 The Team
- **Muhammad Taha Nasir**: Frontend Lead & Visualization Specialist.
- **Aleesha Syeda Hayat**: Backend Architecture & API Integration.
- **Laiba Afridi**: Data Pipeline & Signal Propagation Modeling.

---

## 📝 License
This project was developed for the **Spring 2026 End-of-Semester AI Project**. Proprietary Simulation Environment.
