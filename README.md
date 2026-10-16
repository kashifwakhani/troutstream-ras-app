# 🐟 TroutStream RAS — Rainbow Trout Farm Manager

A clean, mobile-first aquaculture management application built specifically for **Rainbow Trout (*Oncorhynchus mykiss*)** farming in **Recirculating Aquaculture Systems (RAS)**.

---

## 🚀 Key Features

- **📊 Comprehensive RAS Dashboard**:
  - Total fish stock count & estimated biomass (kg)
  - Daily feed consumption & % body weight feeding rates
  - Live water parameter indicators (DO, Temp, pH, TAN, Nitrite, un-ionized NH3)
  - Real-time safety status badges with configurable rainbow trout thresholds
  - Recent farm operations log

- **🌊 Tank Management & Transactional Transfers**:
  - Multi-tank tracking (Nursery, Fingerlings, Pre-growout, Finishing)
  - Water volume (m³), diameter, depth, fish count, and average weights (g)
  - Stocking density calculation: `Density = Biomass (kg) / Volume (m³)`
  - **Transactional Fish Transfers**: Conserves total farm fish population; atomic source reduction and destination addition with weighted average recalculation.

- **🧪 Water Quality & Chemistry Monitoring**:
  - Multi-probe testing log (Temperature, DO, pH, TAN, Nitrite, Nitrate, Alkalinity, CO2, flow rate)
  - **Live Emerson Formula**: Automatic calculation of toxic un-ionized ammonia ($NH_3$) from TAN, pH, and water temperature.
  - Interactive multi-parameter historical trend charts.

- **🥣 Feed & Nutrition Operations**:
  - Daily feeding sessions logger with appetite response tracking (Aggressive, Good, Moderate, Poor)
  - Feed formulation warehouse inventory balances (Inicio Plus, Nutra RC, Aller Silver, EFICO)
  - Estimated feed costs and FCR tracking.

- **⚖️ Biometric Sampling & Growth Analytics**:
  - Sampling records with minimum, maximum, and average fish weights
  - Fulton’s Condition Factor ($K = 100 \times W / L^3$)
  - Specific Growth Rate (SGR %/day) and Average Daily Gain (ADG g/day)
  - Estimated days to target market harvest weight.

- **⚠️ Mortality & Health Log**:
  - Mortality rate analytics (daily % and cumulative count)
  - Pathology and symptom recording with corrective actions & quarantine logs.

- **⚙️ RAS Equipment & Utility Usage Register**:
  - Register for Drum filters, MBBR biofilters, UV sterilizers, PSA oxygen generators, pumps, degassers, and backup generators.
  - Run hours and maintenance schedules.
  - Daily water makeup ($m^3$), electricity ($kWh$), and liquid oxygen ($kg$) consumption.

- **📁 Reports & CSV Exports**:
  - Executive facility summaries.
  - One-click CSV export for Water Quality, Feeding, Tanks, Sampling, and Mortality logs.

- **📱 Mobile App & Capacitor Ready**:
  - Mobile-responsive UI with simulated handheld frame toggle.
  - Ready for **Android APK build** via Capacitor (`@capacitor/android`).
  - Full **PWA** support for instant installation on Android Chrome.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Mobile Container**: Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
- **Backend API**: Node.js, Express, TypeScript (`tsx`)
- **Validation**: Zod
- **Database Architecture**: PostgreSQL schema DDL (`src/db/schema.sql`) and Prisma ORM (`src/db/prisma/schema.prisma`)

---

## 💻 Local Development Setup (Ubuntu / macOS / Windows)

```bash
# 1. Clone the repository
git clone https://github.com/kashifwakhani/troutstream-ras-app.git
cd troutstream-ras-app

# 2. Install dependencies
npm install

# 3. Start development server (Node.js Express + Vite)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📱 Running on Android Mobile via Capacitor

To compile and run this app as a native Android app:

```bash
# 1. Build web production bundle and sync with Capacitor Android project
npm run cap:build

# 2. Open project in Android Studio
npm run cap:open
```

In Android Studio:
1. Connect your Android phone via USB (with **USB Debugging** enabled in Developer Settings).
2. Select your device from the target device dropdown.
3. Click the green **Run (▶)** button to install and launch directly on your phone!

Or build an APK:
- **Build > Build Bundle(s) / APK(s) > Build APK(s)** in Android Studio.

---

## 📄 License

Apache-2.0
