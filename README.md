# 🧬 Blueprints - Drug Repurposing & Molecular Insight Engine

Blueprints is an advanced full-stack platform engineered to automate drug repurposing, extract biochemical data, and provide predictive pharmacological profiling. It marries multi-agent AI research (via LangChain/LangGraph and Groq's high-speed inference) with structural and clinical datasets (PubChem, ClinicalTrials.gov) into an interactive, visually stunning intelligence dashboard.

## 🚀 Key Features

- **Automated AI Analysis Pipeline**: Powered by LangGraph and LLaMA-series models over the Groq API for rapid intelligence synthesis and report generation.
- **Workflow Animation Pipeline**: [Live Architecture & Data Flow Visualization](https://invisible-project.vercel.app/)
- **Biochemical & Pharmacological Models**: Direct integrations with PubChem PUG REST API for fetching live physicochemical descriptors (Heavy Atom Counts, Stereocenters, Complexities), toxicity schemas (LD50), and ADME data.
- **Repurposing Intelligence**: Generates condition viability scores and parses active/terminated clinical trials targeting the queried compounds to surface next-generation market opportunities.
- **Real-Time Interactive AI Skeptic/Chatbot**: Server-Sent Events (SSE) chatbot tailored dynamically to the investigated drug contexts to query specific facts directly against the active analytical report.
- **Built-in Resilience**: Implements a randomized array key-rotation mechanism to distribute load and seamlessly bypass strict rate-limiting environments (429/401 errors).
- **Visual Intelligence**: 3D spatial representations of molecules and comprehensive, distributable PDF reports on the fly.
- **Secure Architecture**: Google OAuth login wrapped securely with `express-session`, `connect-mongo`, and an overarching MongoDB cluster.

## 🏗️ Tech Stack

### Frontend (Client)
- **Core Platform**: React, TypeScript, Vite
- **Styling & UI**: Tailwind CSS v4, Framer Motion, Radix UI (Shadcn), Lucide React
- **Data Visualization**: Recharts, D3
- **Exporting**: Local PDF string parsing and stylized Blob building.

### Backend (Server)
- **Server Environment**: Node.js + Express (TypeScript / `tsx`)
- **Database**: MongoDB (via `mongoose` and `connect-mongo`)
- **Authentication**: Passport.js (Google OAuth 2.0 flow)
- **AI Tooling**: LangChain Core / Community, Groq LLM Endpoints
- **External Data Sources**: 
  - `https://pubchem.ncbi.nlm.nih.gov/rest/pug`
  - `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view`
  - `https://clinicaltrials.gov/api/v2/studies`

## ⚙️ Local Setup Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (for extended Jupyter notebook and Python-based data pipelines/cleanups)
- **MongoDB** (Local instance or remote Atlas Cluster)
- **Google Cloud Console account** (for OAuth API Credentials) 
- **Groq API Keys** (Preferably multiple for resilient ratelimit-hopping)

### 2. Required Environment Configuration
Create a `.env` file in the root directory (and ensure the server has scope of it or a mirrored copy in `backend/`) with your keys:

```dotenv
# .env

# Server Setup
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173  # Change to your Vite preview port if different

# Database & Sessions
MONGODB_URI=mongodb+srv://<auth>@<cluster>.mongodb.net/?appName=Blueprints
SESSION_SECRET=your_super_secret_session_string

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Engine (Comma-separated for auto-rotation rate limit bypass)
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3
GROQ_KEY=$GROQ_API_KEYS
```

### 3. Backend Setup

```bash
cd backend
npm run setup
npm install
# Boots up tsx server.ts with live API routes and SSE streams
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
# Ignites the Vite development environment
npm run dev
```

*The application will now be running on `localhost:5173` communicating with the backend API on `localhost:3000`.*

---
*Note: Standalone Python scripts found in this project folder (`agent_workflow.py`, `rag_server.py`, `script_fixes.py`) are legacy prototypes or supplementary microservices. Setting up an active python virtual env (`.venv`) and installing dependencies via `pip install -r backend/requirements.txt` allows independent testing of the RAG pipelines.*

by ani gay
