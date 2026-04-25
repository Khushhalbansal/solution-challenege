# 🌐 NEXUS-FLOW AI 

**A Self-Healing Global Logistics & Supply Chain Intelligence Hub**

Nexus-Flow AI is an autonomous, state-space optimization engine designed to predict, detect, and instantly reroute global supply chain disruptions (Black Swan events). 

Built for the Hackathon, this system integrates deep chain-of-thought AI (Gemini Pro), secure cryptographically-verified execution environments, and real-time interactive UI dashboards.

## 🚀 Key Features

### 1. The Core Brain (Gemini Pro Thinking & Optimizer)
- **$O(E + V \log V)$ Heuristics:** Uses a heavily optimized Dijkstra priority queue (`heapq`) to calculate alternative shipping routes across 1000+ node global graphs in under `200ms`.
- **Dynamic Risk Penalties:** Automatically applies risk multipliers to routes based on incoming telemetry (e.g., Red Sea conflict, Port of LA strikes).

### 2. The Ralph Loop (Continuous Resilience Framework)
- **Live Telemetry Polling:** Constantly monitors GPS shipment latency against predicted times.
- **Self-Healing:** If variance exceeds 15%, it triggers a "Logic Drift" error, diagnosing the root cause (e.g., Unforecasted Hurricane) and injecting a permanent correction into the `resilience_memory.db` SQLite database.

### 3. The Cyber Defense Layer (Code Rabbit & Ledger)
- **Tamper-Proof Blockchain:** Every automated reroute execution is hashed via `SHA-256` and linked to the previous event in an immutable ledger.
- **mTLS Network Security:** Built to support Mutual TLS and zero-trust API architectures to prevent malicious lateral movement during Black Swan gridlocks.

### 4. Tactical Command Dashboard (Vite + React)
- **Interactive SVG Topology Map:** Click any node (e.g., Los Angeles) to trigger a simulated Black Swan cyber-attack.
- **Financial Impact Calculator:** Displays live Fleet Cost, Estimated Delay Loss, Carbon Footprint ($CO_2$), and total **AI Money Saved** during an emergency reroute.
- **Live Logic Terminal:** Streams raw mathematical operations and routing outputs in real-time.

## 🛠️ Architecture Stack

- **Frontend:** React, Vite, TailwindCSS v4, Framer Motion, Lucide React
- **Backend / Engine:** Python 3, FastAPI, Uvicorn, asyncio
- **Databases:** SQLite (Resilience Memory), JSONL (Blockchain Ledger & System of Record)

## 🏃‍♂️ How to Run Locally

### 1. Run the Auto-Setup Script (Windows)
```powershell
.\setup.ps1
```
*(This script will automatically install all Python/NPM dependencies, launch the FastAPI backend server on port 8000, and spin up the Vite dev server).*

### 2. Manual Startup
**Backend API:**
```bash
cd nexus-core
pip install -r ../requirements.txt
python mock_api.py
```

**Frontend Dashboard:**
```bash
cd nexus-ui
npm install
npm run dev
```

Navigate to `http://localhost:5173` to interact with the command center.

---
*Built for the Solution Challenge.*
