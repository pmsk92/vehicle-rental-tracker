# Car Rental Expense Tracker

A simple, zero-dependency web application for tracking car rental trip expenses and maintenance logs. Includes a driver-facing submission form and an admin dashboard. Runs as a static site (HTML/CSS/JS) with localStorage persistence; optional hooks for Firebase are provided.

## Features

- Driver form to submit trip details and expenses
- Admin dashboard to review, edit, and manage records
- Local persistence using `localStorage` (no backend required)
- Simple styling and clean layout
- Optional Firebase configuration for future cloud persistence
- Ready-to-deploy on any static hosting (Netlify, GitHub Pages, etc.)

## Tech Stack

- HTML, CSS, JavaScript (Vanilla)
- localStorage for data persistence
- Optional: Firebase (see `FIREBASE_SETUP.md`)

## Project Structure

```
vehicle-rental-tracker/
├── admin.html              # Admin dashboard
├── app.js                  # Core JS logic
├── driver.html             # Driver trip submission form
├── FIREBASE_SETUP.md       # Guide for optional Firebase integration
├── firebase-config.js      # Placeholder for Firebase client config
├── index.html              # Landing page / entry point
├── netlify.toml            # Netlify configuration (static deploy)
├── README.md               # This guide
├── server.py               # Optional local server script (not required)
├── styles.css              # Global styles
└── data/
    ├── maintenance.json    # Sample maintenance data
    └── trips.json          # Sample trip data
```

## Quick Start (Local)

You can open the site directly or run a lightweight local server.

### Option A: Open directly

1. Double-click `index.html` to open in your browser.
2. Use the navigation to access `driver.html` and `admin.html`.

Note: Some browsers impose stricter security when opening files directly. If anything fails to load, use Option B.

### Option B: Local server (recommended)

Use Python’s built-in HTTP server:

```bash
cd /path/to/vehicle-rental-tracker
python3 -m http.server 8000
# Visit http://localhost:8000 in your browser
```

Alternative (Node.js):

```bash
npm -g install http-server
cd /path/to/vehicle-rental-tracker
http-server -p 8000
```

## Usage Guide

### Driver Workflow (`driver.html`)

- Open the Driver form.
- Enter trip details (e.g., date, vehicle, start/end locations, distance, expenses).
- Submit the form to save the record. Data is stored locally via `localStorage`.

### Admin Workflow (`admin.html`)

- Open the Admin dashboard.
- View submitted trips and maintenance entries.
- Perform common actions (depending on UI): filter, sort, edit, remove, and export.
- Changes persist locally via `localStorage` unless cloud integration is added.

## Data & Persistence

By default, this app uses `localStorage` in the browser. Data is stored per browser/device and is not shared across machines unless you use the optional data-folder server or Google Sheet.

### Google Sheet (recommended: drivers from anywhere, no server)

Use the **same driver form** (same fields, auto-calculated Total KMs and Company Revenue) and save submissions to a Google Sheet. Drivers open your app (e.g. GitHub Pages) and submit; you see everything in the dashboard. No local server needed. See **[GOOGLE_SHEET_SETUP.md](GOOGLE_SHEET_SETUP.md)** for setup. Set `GOOGLE_SCRIPT_URL` in `app.js` to your Apps Script Web App URL after deploying.

### Data folder (JSON files in `data/`)

When you run the project with the included Python server, every trip and maintenance add/update/delete is written to `data/trips.json` and `data/maintenance.json`. Each trip and maintenance record has a unique `id`; the server updates or removes by that id on edit/delete.

- **Run the server and open the app from it** so the app uses the data folder as source of truth:
  ```bash
  python3 server.py
  ```
  Then open **http://localhost:8010** (not 8000). The app will load and save from `data/` and keep localStorage in sync.
- **Without the server** (e.g. opening `index.html` directly or from GitHub Pages), the app uses only `localStorage`; the data folder is not updated.
- **Pushing to GitHub**: After using the app with the server, you can `git add data/` and `git commit` / `git push` so the JSON files are versioned in the repo.

- Scope: Each browser profile maintains its own data when not using the server.
- Clearing: Clearing site data or using private mode will reset localStorage (not the data folder).
- Backup: Export via the dashboard, or rely on the JSON files when the server is used.

### Seeding with Sample Data (Optional)

Sample JSON files are provided in `data/`. To seed localStorage quickly, you can paste the following in the browser console (Admin page):

```js
// Seed trips
fetch('data/trips.json')
  .then(r => r.json())
  .then(trips => localStorage.setItem('trips', JSON.stringify(trips)));

// Seed maintenance
fetch('data/maintenance.json')
  .then(r => r.json())
  .then(items => localStorage.setItem('maintenance', JSON.stringify(items)));
```

Adjust keys if your implementation uses different names.

## Firebase (Optional)

This project includes `FIREBASE_SETUP.md` and `firebase-config.js` for teams who want to move from localStorage to cloud persistence.

High-level steps:

1. Create a Firebase project and enable Firestore.
2. Copy your web config into `firebase-config.js`.
3. Include Firebase scripts in your HTML (CDN example):
   ```html
   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"></script>
   <script src="firebase-config.js"></script>
   ```
4. Update `app.js` to write/read from Firestore instead of `localStorage`.

Security notes:

- Client-side Firebase config (API key) is not a secret; however, do not commit service account keys or anything intended for server-side use.
- Add server-side validation if you accept untrusted input.

## Deployment

This is a static site—any static host works. Two common options:

### Netlify

1. Create a new site on Netlify.
2. Deploy by:
   - Connecting your GitHub repo, or
   - Drag-and-dropping the project folder.
3. If using `netlify.toml`, default static behavior should be fine.

### GitHub Pages

1. Push the project to GitHub.
2. In repository settings, enable GitHub Pages for the main branch.
3. Access the site at the provided Pages URL.

## Development Workflow

- No build step is required; open in a browser or run a local server.
- Make changes to `app.js` and `styles.css` and refresh to see updates.
- If integrating Firebase or other services, document any new environment requirements in this README.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "Add your feature"`.
4. Push: `git push origin feature/your-feature`.
5. Open a Pull Request with a clear description.

## Handoff & ZIP

To share this project as a ZIP:

```bash
cd "/Users/784968/Library/CloudStorage/OneDrive-Cognizant/Documents"
zip -r vehicle-rental-tracker.zip vehicle-rental-tracker -x "*/.git/*" "*.DS_Store"
```

Verification:

```bash
mkdir -p /tmp/verify-vrt
unzip vehicle-rental-tracker.zip -d /tmp/verify-vrt
open /tmp/verify-vrt/vehicle-rental-tracker/index.html
```

## Notes & Caveats

- localStorage is browser-specific and not a multi-user store.
- If you need multi-user and shared data, integrate Firebase or a custom backend.
- Do not commit secrets; keep any sensitive credentials out of version control.

## Contact

For questions or support, please reach out to the project maintainer or include contact details here.

---

This README provides end-to-end guidance for outside developers to run, develop, and deploy the Car Rental Expense Tracker with minimal friction.
# 🚗 Car Rental Expense Tracker

Simple, lightweight web app to record trips, track expenses, and calculate profit for a rental vehicle business. Built with vanilla HTML, CSS, and JavaScript. Stores data in browser `localStorage` with optional Firebase sync.

---

## ✨ Features

- **Driver Trip Form**: Submit trip details and expenses fast.
- **Admin Dashboard**: View trips, totals, and profit at a glance.
- **Maintenance Tracking**: Log service/repair expenses separately.
- **Auto Calculations**: `totalKms`, `totalExpenses`, and `profit` computed.
- **Month Filter**: Summaries by month or all time.
- **Storage Options**: Works offline via `localStorage`; optional Firestore.

---

## 📄 Pages

- `index.html`: Landing with links to Driver and Admin.
- `driver.html`: Trip submission form for drivers.
- `admin.html`: Login + dashboard, maintenance form, tables and stats.

---

## 🧾 Fields & Calculations

Trip submission (Driver Form):
- Driver: `driverName` (required)
- Trip: `tripName` (required)
- KMs: `startKms` (required), `endKms` (required) → `totalKms = end - start`
- Mileage: `mileage` (optional)
- Income: `rentalFee` (required)
- Expenses: `fuelExpense` (required), `permitCost` (default 0), `parkingFee` (default 0), `driverBata` (default 0)
- Derived: `totalExpenses = fuel + permit + parking + bata`, `profit = rentalFee - totalExpenses`

Maintenance entry (Admin):
- Description: `maintenanceDesc` (required)
- Cost: `maintenanceCost` (required)

Dashboard stats (Admin):
- Total Revenue = Σ `rentalFee`
- Trip Expenses = Σ `totalExpenses`
- Maintenance = Σ maintenance `cost`
- Total Expenses = Trip Expenses + Maintenance
- Net Profit = Total Revenue − Total Expenses (green/red styling)

---

## 🔐 Admin Login (Default)

- Username: `admin`
- Password: `Exotic@2025`

Change these in `app.js` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `RECOVERY_EMAIL`). The login state persists per tab via `sessionStorage`.

---

## 💾 Data Storage

Local (default):
- Trips key: `carRentalTrips`
- Maintenance key: `carRentalMaintenance`
- Persists per browser profile; clearing site data removes records.

Firebase (optional):
- Collections: `trips`, `maintenance`
- Each document includes the fields described above. When using Firestore, rows include a document `id` used for per-row delete.

Per-row delete works in both modes. In Firebase, deletes are soft (marked `deleted: true`); in localStorage, records are removed by their local `id`.

---

## 🚀 Run Locally

Any static server works. Example with Python:

```bash
cd "/Users/784968/Library/CloudStorage/OneDrive-Cognizant/Documents/vehicle-rental-tracker"
python3 -m http.server 8000
```

Open: http://localhost:8000/index.html

Stop server with `Ctrl+C`.

---

## ☁️ Optional: Firebase Sync

This repo includes a ready `firebase-config.js`. To enable sync across devices:

1) Create a Firebase project and Firestore database (test mode OK).
2) Copy your `firebaseConfig` into `firebase-config.js`.
3) Open the app and submit a trip; verify it appears in Firestore.

See full guide: [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

---

## 🔎 Testing Checklist

Driver Form
- Submit with required fields; see success message.
- Negative/invalid inputs rejected by browser validation.

Admin Dashboard
- Login with default admin credentials.
- Verify stats update after submissions.
- Add a maintenance record; totals should reflect.
- Change Month filter; lists and totals should update.

Persistence
- Refresh pages; data remains (localStorage) or syncs (Firestore).

Reset
- Clear all data in DevTools if needed:
  ```js
  localStorage.removeItem('carRentalTrips');
  localStorage.removeItem('carRentalMaintenance');
  ```

---

## 🗂️ Project Structure

```
vehicle-rental-tracker/
├── index.html              # Landing
├── driver.html             # Driver trip form
├── admin.html              # Admin login + dashboard
├── styles.css              # Styling
├── app.js                  # Core logic (storage, UI wiring)
├── firebase-config.js      # Optional Firebase config (CDN modules)
├── FIREBASE_SETUP.md       # Step-by-step Firebase guide
└── README.md               # This file
```

---

## ⚙️ Configuration

- Currency symbol: hardcoded as `₹` in dashboard rendering (edit in `app.js`).
- Admin credentials: edit `ADMIN_USERNAME`, `ADMIN_PASSWORD` in `app.js`.
- Storage keys: `TRIPS_KEY`, `MAINTENANCE_KEY` in `app.js`.
- Firebase libs: loaded via CDN; version pins in `firebase-config.js`.

---

## 🧰 Troubleshooting

- “Firebase not configured” in console: Update `firebase-config.js` with real config.
- Data not saving: Avoid incognito; ensure `localStorage` enabled.
- No rows after submit: Check console errors; ensure `app.js` is loaded.
- Month filter empty: Add at least one trip/maintenance entry with a valid date.
- Per-row delete: Works when Firebase is enabled; otherwise use Clear All.

---

## 🛡️ Notes & Privacy

- Local mode is per-device, per-browser. Clearing site data removes records.
- No driver authentication; admin login is client-side only.
- Review Firestore rules before production (see guide) if enabling cloud.

---

## 🗺️ Roadmap (Optional)

- Vehicle-level segmentation, CSV/PDF export, charts, basic auth, and hardened delete permissions with Firestore rules.

---

Ready to go: open `index.html` locally or deploy to any static host. 🚀

---

## 🌐 Deployment

- GitHub Pages
  - Push this project to a GitHub repo (root has `index.html`).
  - In Settings → Pages, choose `main` branch and `/root`.
  - Visit the Pages URL after it builds.

- Netlify
  - Drag-and-drop the folder or connect the GitHub repo.
  - The included `netlify.toml` publishes from the project root; no build step required.

- Local quick run
  - macOS/Linux:
    ```bash
    python3 -m http.server 8010
    ```
  - Windows (PowerShell):
    ```powershell
    python -m http.server 8010
    ```
