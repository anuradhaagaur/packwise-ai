# PACKWISE AI 2.0 — Intelligent Food Packaging Recommendations

[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

PACKWISE AI is a decision-support and rapid prototyping platform designed for food technologists, packaging engineers, and FMCG brands. It matches food biochemical attributes (moisture, lipid content, pH, live produce respiration) against 13+ packaging polymers and barrier composites.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🌟 Key Features

* **Transparent Rule-Based Scoring Engine**: Multi-factor weighted barrier calculations for Oxygen ($O_2$), Moisture ($H_2O$), Temperature, Seal Integrity, Mechanical Strength, Cost, and Circularity.
* **Explainable Recommendations**: Dynamic factor contribution score breakdown (`Moisture: 24/24 pts`, `Oxygen: 22/22 pts`) with engineering validation reasons.
* **4-Step Analysis Wizard**:
  1. Product Form & Category Selection
  2. Intrinsic Biochemical Properties (Moisture %, Oil %, pH, Sensitivities)
  3. Storage Profile & Target Shelf-Life
  4. Transport Logistics & Weight Priorities
* **Live Respiring Fresh Produce Logic (EMAP)**: Micro-perforated film matching, $O_2/CO_2$ gas transmission balance, anti-fog moisture control, and condensation risk evaluation.
* **13+ Packaging Materials Database**: Detailed datasheets for LDPE, HDPE, PET, BOPP, Metallized PET, Aluminium Foil Laminate, EVOH Multilayer, PLA, Cellulose Film, Paper-Based Barrier Film, Breathable PE Film, and Micro-Perforated Film.
* **3-Way Side-by-Side Comparison**: Select up to 3 materials and compare OTR, WVTR, thickness, sealability, cost, and recyclability.
* **Technical Dossier & PDF Export**: Instant client-ready PDF technical assessment reports with one click.
* **Dark / Light Mode**: Seamless theme switching with persistent storage.
* **Supabase Backend**: Complete PostgreSQL database schema with Row Level Security (RLS) policies located in `supabase/migrations/`.

---

## 🗄 Database Setup (Supabase)

To connect with a live Supabase project:
1. Copy `.env.example` to `.env`.
2. Add your project URL and anonymous key:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the SQL migration in `supabase/migrations/20260928000000_packwise_schema.sql` inside your Supabase SQL Editor.

*(Note: The application includes an automatic local storage database bridge, allowing complete functionality even without Supabase credentials).*

---

## 📁 Project Structure

```text
packwise-ai/
├── src/
│   ├── components/
│   │   ├── analysis/       # Wizard steps 1-4 & animated step sequencer
│   │   ├── layout/         # Header, Footer, AuthModal, Theme switch
│   │   ├── materials/      # MaterialCard, DetailModal, CompareDock & Modal
│   │   ├── results/        # HeroScoreCard, WhyRecommended, SpecsGrid, FreshProducePanel, Alternatives, LCAScore
│   │   ├── history/        # History list, filter, duplicate, delete
│   │   ├── reports/        # Report viewer and dossiers
│   │   └── ui/             # Button, Card, Badge, Modal, Input
│   ├── pages/              # Dashboard, New Analysis, Results, Materials, History, Reports, Admin
│   ├── services/           # Recommendation engine, Analyses, Commodities, Materials, Reports
│   ├── types/              # TypeScript definitions
│   ├── data/               # Seed commodities, seed materials, sample scenarios
│   └── lib/                # Supabase client & jsPDF generator
├── supabase/
│   └── migrations/         # PostgreSQL schema & RLS policies
└── public/
```

---

## ⚖️ Scientific Prototype Disclaimer
PACKWISE AI is a decision-support prototype. Compatibility scores, shelf-life forecasts, MAP gas recommendations, and barrier ratings are model estimates requiring formal food science laboratory and supplier testing.
