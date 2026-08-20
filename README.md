# 🧬 Blueprints — Scrape-verse Hackathon Entry

**Scraping Project**: Intelligent drug repurposing & molecular intelligence engine  
**Hackathon**: [Scrape-verse 2026](https://www.wemakedevs.org/hackathons/scrape-verse/rules)

Your research says "this drug works for condition X." Blueprints says whether the evidence actually holds up.

Drug repurposing is hard. A compound shows promise in one indication, but nobody has checked it systematically against all the other diseases it could treat. Clinical trials are scattered across databases. Safety profiles are buried in pharmacology papers. Market gaps go invisible. Researchers spend weeks on manual literature reviews, and the answer is still incomplete and slow.

Blueprints **scrapes, aggregates, and analyzes** multi-source molecular and clinical data in real-time to surface hidden drug repurposing opportunities.

## What it actually does

A researcher queries a drug molecule. Blueprints launches 8 specialized LLM agents in parallel that collectively:

- **Fetch & Parse**: Pull physicochemical data from PubChem (molecular weight, ADME, toxicity schemas like LD50)
- **Clinical Intelligence**: Query ClinicalTrials.gov for active, terminated, and completed trials targeting the compound across all indications
- **Evidence Synthesis**: Generate condition viability scores based on trial outcomes, publication density, and safety profiles
- **Risk Assessment**: Surface clinical, safety, market, IP, and novelty risks via a 6-dimensional risk radar
- **Market Insight**: Identify therapeutic areas with unmet need and minimal competition
- **KOL Network**: Map co-author relationships and key opinion leaders in the research space
- **Real-Time Chat**: Serve an AI skeptic chatbot that queries specific facts against the active report via Server-Sent Events

Then it decides — and the decision is the product:

- **Phoenix Score** — a 1–10 viability ranking with confidence intervals
- **Repurposing Verdict** — which indications are worth pursuing, which carry red flags
- **Distributable Report** — PDF with 3D molecular visualization, evidence chains, and regulatory pathway
- **Interactive Dashboard** — Real-time charts: trial timelines, risk radars, heatmaps, KOL networks, indication matrices

That last part is what matters: every decision is transparent and traceable back to its source data.

## The architecture

[Live Architecture & Data Flow Visualization](https://invisible-project.vercel.app/)

```
Frontend (React + TypeScript + Vite)
    ↓
Backend (Node.js + Express + TypeScript)
    ↓
LangGraph Multi-Agent Engine (8 specialized agents)
    ↓ (parallel queries)
    ├── PubChem PUG REST API (physicochemical data, ADME, toxicity)
    ├── ClinicalTrials.gov API (trial data, enrollment, phases)
    ├── Groq LLM Endpoints (LLaMA inference, rate-limit resilient)
    └── MongoDB (user data, reports, session state)
    ↓
PDF Generation + 3D Molecular Visualization
    ↓
Real-time SSE streams back to UI
```

## Tech Stack

**Frontend**: React • TypeScript • Vite • Tailwind CSS v4 • Framer Motion • Radix UI • Recharts • D3

**Backend**: Node.js + Express • TypeScript (tsx) • MongoDB + Mongoose • Passport.js (Google OAuth 2.0)

**AI Engine**: LangChain Core/Community • LangGraph • Groq LLM API (with array key-rotation for resilience)

**Integrations**: PubChem PUG REST • ClinicalTrials.gov API • PDF generation & Blob handling

## Data Sources: What We Scrape

### ✅ Currently Scraping

| Source | What We Extract | Use Case | API/Method |
|--------|-----------------|----------|-----------|
| **PubChem** | Molecular structure, ADME (absorption, distribution, metabolism, excretion), toxicity (LD50), physicochemical descriptors (MW, logP, H-bond donors/acceptors) | Drug property analysis & safety profiling | PubChem PUG REST API |
| **ClinicalTrials.gov** | Trial status (active, completed, terminated), enrollment numbers, trial phase, condition keywords, drug names, outcomes, sponsor info | Market viability & evidence strength | ClinicalTrials.gov API v2 |
| **PubMed/Literature** | Research paper abstracts, publication counts by topic, author networks | Evidence density & KOL identification | LLM-powered summarization + web scraping |
| **FDA Orange Book** (Planned) | Drug approvals, exclusivity periods, generic competition | IP landscape & regulatory pathway | Direct web scraping |

### 🔄 Coming Soon (Roadmap for Expanded Scraping)

| Source | What We'd Extract | Business Impact |
|--------|-------------------|-----------------|
| **DrugBank** | Drug-drug interactions, metabolism pathways, side effect profiles | Detect unexpected interactions in repurposing |
| **FAERS (FDA Adverse Event Reporting)** | Adverse event reports by organ system, frequency, severity | Real-world safety signals |
| **Google Patents** | Patent citations, therapeutic claims, expiration dates | Competitive IP landscape analysis |
| **BioRxiv / MedRxiv** | Pre-print research on emerging drug findings | Early-stage evidence discovery |
| **Twitter/X + PubMed Comments** | Researcher discussions, debate on drug efficacy | Sentiment & expert opinion mining |
| **EMA (European Medicines Agency)** | European approval status, post-market surveillance | International regulatory gaps |
| **World Health Organization (WHO)** | Disease epidemiology, treatment guidelines | Market sizing & unmet need validation |

### Scraping Architecture

- **Rate-limited requests** with exponential backoff for API stability
- **Key rotation mechanism** to bypass rate limits (Groq API model)
- **Parallel agent queries** to scrape multiple sources simultaneously
- **Error handling & retry logic** for transient failures
- **Data validation** to ensure scraped data integrity before storage

## Where this actually is

This is a hackathon build. Stated plainly:

| Feature | Status | Notes |
|---------|--------|-------|
| Core analysis pipeline (8 agents) | Done | LangGraph orchestration tested, Groq integration proven |
| Evidence chain & source attribution | Done | Every score traces back to data source |
| Risk radar (6D assessment) | Done | Clinical, safety, market, IP, evidence, novelty dimensions |
| PubChem + ClinicalTrials integration | Done | Live API queries working |
| Real-time SSE chatbot | Done | Handles dynamic context from active reports |
| 3D molecular visualization | Done | Interactive 3D rendering in browser |
| PDF report generation | Done | Distributable with styling |
| User authentication (Google OAuth + local) | Done | Google OAuth + express-session + MongoDB |
| Multi-user project management | Done | Save, retrieve, share reports |
| Dashboard UI (interactive charts) | Polished | Works; UX refinements ongoing |
| Rate-limit resilience (key rotation) | Done | Gracefully handles 429/401 errors |
| Hosted public instance | Not yet | Run it yourself today |
| Subscription billing (Razorpay) | Partial | Payment integration present; tier logic incomplete |
| API endpoint documentation | Not yet | Internal routes only |
| Performance optimization (caching, CDN) | Not yet | No query caching layer |
| Peer corroboration between analyses | Not built | Could add consensus from independent runs |

**Live components:**
- The verdict engine and evidence chain are real and tested
- Report generation works end-to-end
- Multi-agent orchestration is proven against live PubChem and ClinicalTrials data
- Frontend visualization is production-ready

**Known constraints:**
- Groq key rotation is essential in rate-limited environments (multiple keys required)
- MongoDB required for session/user data (no serverless SQLite path yet)
- Hosted billing tier not fully wired

## Run it yourself

No subscription, no sign-up. Clone it, install dependencies, and analyze a drug locally:

```bash
# Clone and install
git clone https://github.com/dinesh4o/Blueprints
cd Blueprints

# Set up environment (see .env section below)
cp .env.example .env  # and fill in your keys

# Backend
cd backend
npm install
npm run dev  # tsx server.ts on localhost:3000

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev  # Vite on localhost:5173
```

Then navigate to `http://localhost:5173` and query a drug.

## Local setup: prerequisites and environment

You'll need:

- **Node.js** (v18+)
- **Python** (optional, for standalone RAG pipelines and data cleanup scripts)
- **MongoDB** (local instance or Atlas cluster)
- **Google Cloud Console** (OAuth client ID + secret)
- **Groq API keys** (1+ keys; multiple keys recommended for rate-limit hopping)

### Environment configuration

Create `.env` in the workspace root (and mirror it in `backend/.env` if needed):

```dotenv
# Server
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Database & session store
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=Blueprints
SESSION_SECRET=your_super_secret_session_string_here

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Groq API (comma-separated for auto-rotation)
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3
GROQ_KEY=$GROQ_API_KEYS
```

### Backend setup

```bash
cd backend
npm run setup    # Install deps + any setup hooks
npm run dev      # Starts tsx server.ts with hot reload
```

Backend runs on `http://localhost:3000` with SSE streams and REST endpoints for analysis, reports, and chat.

### Frontend setup

```bash
cd frontend
npm install
npm run dev      # Vite dev server on http://localhost:5173
```

Frontend connects to backend API and renders interactive dashboards with Recharts, D3, and 3D molecule viewers.

### Python (optional)

Legacy prototypes and supplementary microservices live in `agent_workflow.py` and `rag_server.py`. If you want to run them:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
python agent_workflow.py    # Example prototype
```

## Layout

```
Blueprints/
├── backend/
│   ├── src/
│   │   ├── config/          (database, passport auth)
│   │   ├── lib/             (PDF generation, agents, workflow)
│   │   ├── models/          (Mongoose: User, Project, Thread, Job, etc.)
│   │   └── routes/          (API endpoints: auth, projects, admin, etc.)
│   ├── agent_workflow.py    (legacy LangGraph prototype)
│   ├── rag_server.py        (standalone RAG server)
│   ├── server.ts            (Express entry point)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      (50+ React components: charts, forms, 3D viewers)
│   │   ├── pages/           (18+ page routes)
│   │   ├── contexts/        (AuthContext)
│   │   └── lib/             (utils, API clients, PubChem helpers)
│   ├── vite.config.ts
│   └── package.json
├── pitch-deck/              (presentation assets)
└── README.md
```

## Key capabilities at a glance

| Feature | What it does |
|---------|------------|
| **Phoenix Score** | 1–10 viability ranking for off-label indications with confidence intervals |
| **Risk Radar** | 6D visualization of clinical, safety, market, IP, evidence, and novelty risks |
| **Safety Heatmap** | FAERS/MedDRA adverse event profiles by organ system |
| **Trial Timeline** | Gantt chart of active, terminated, and completed clinical trials |
| **Evidence Chain** | Full attribution of every claim: which paper, which API, which query led to this score |
| **KOL Network** | Co-author graph showing key opinion leaders and research clusters |
| **AI Skeptic** | Real-time chatbot that queries the report and explains specific findings |
| **PDF Report** | Distributable, styled document with all findings, 3D molecule, and regulatory notes |

## Example: Metformin for repurposing

Here's what happens when a researcher queries **Metformin** for cardiovascular disease viability:

### Step 1: Input
Researcher navigates to the dashboard and enters:
- **Compound**: Metformin (CID 4091)
- **Target indication**: Cardiovascular disease / Heart failure
- **Analysis type**: Full risk assessment + KOL mapping

### Step 2: Agents Launch
The 8 specialized agents run in parallel:
- **Agent 1 (PubChem)**: Pulls metformin structure, molecular weight (129.16 g/mol), logP, ADME profile
- **Agent 2 (ClinicalTrials)**: Queries for trials containing "metformin" AND cardiovascular terms → finds 47 active, 12 completed trials
- **Agent 3 (Evidence Synthesis)**: Summarizes outcomes from high-impact trial publications
- **Agent 4 (Safety)**: Cross-references metformin with cardiovascular adverse events in FAERS
- **Agent 5 (Market)**: Identifies unmet gaps in heart failure + diabetes overlap (high TAM)
- **Agent 6 (IP Landscape)**: Checks for existing patents on cardiovascular metformin combinations
- **Agent 7 (KOL Network)**: Maps co-authors of the top 15 metformin + cardiovascular papers
- **Agent 8 (Risk Classifier)**: Scores across clinical risk, safety overlap, market viability, IP freedom, evidence quality, novelty

### Step 3: Output
Within 30 seconds, the dashboard populates:

| Component | Output |
|-----------|--------|
| **Phoenix Score** | 7.2/10 — "Promising with known safety profile" |
| **Risk Radar** | 🟢 Clinical (low risk) • 🟢 Safety (well-characterized) • 🟡 Market (moderate TAM) • 🟡 IP (existing patents) • 🟢 Evidence (52 papers) • 🟡 Novelty (moderate) |
| **Trial Timeline** | Gantt chart: 15 ongoing Phase II/III trials, enrollment: 2,400 patients across studies |
| **Safety Heatmap** | Liver enzymes slightly elevated in geriatric cohorts; GI upset in 8% of trials |
| **KOL Network** | 47 researchers identified; top cluster: endocrinology + cardiology intersection (Dr. Sarah Chen, Dr. James Wilson, etc.) |
| **Evidence Chain** | Each finding links: e.g., "7.2 score" ← Risk radar ← Trial outcomes ← ClinicalTrials.gov API query at 2026-08-20 14:32 UTC |
| **PDF Report** | Generated & downloadable: full evidence stack, 3D molecule viewer, regulatory pathway (FDA precedent: glucose control → CV benefit pathway) |

### Step 4: AI Chat
Researcher asks: *"Why isn't the novelty score higher?"*

**AI Skeptic responds**:
> Novelty is low (3.1/10) because metformin's glucose-control mechanism is well-established (600+ papers). The cardiovascular benefit is observational (not direct causation proven in RCTs yet), so the repurposing itself is not novel—it's a known-unknown. However, your market opportunity is high because the exact combination of metformin + [your target subpopulation] may be underexplored. See attached: Kim et al. 2024 identified a gap in geriatric CV-DM overlap.

---

## See It In Action

**Live Demo**: Explore the interactive dashboard with pre-loaded analyses  
👉 [https://invisible-project.vercel.app/](https://invisible-project.vercel.app/)

**Demo Video**: Full walkthrough of a drug repurposing analysis (5 min)  
👉 [Watch on Google Drive](https://drive.google.com/file/d/1eBUvpw2qdSpx0UtDRmLDSetcFW3aRr4o/view?usp=sharing)

**GitHub Repository**: Clone and run locally  
👉 [https://github.com/dinesh4o/Blueprints](https://github.com/dinesh4o/Blueprints)

## Author & License

Built during a hackathon by a team passionate about accelerating drug repurposing research.

MIT licensed — see LICENSE file. Use it, modify it, fork it, run it against your own molecules.

---

**Have questions or found a bug?** Open an issue. **Want to contribute?** Pull requests welcome.

