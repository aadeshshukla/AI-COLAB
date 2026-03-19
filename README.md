# AI-COLAB

This repository contains multiple projects. The main project documented here is:

## Results Analytics (JNTUH Results Analytics SPA)

A **React + Vite** single-page application (SPA) that lets students fetch their **JNTUH academic results** using a **roll number**, and then shows:

- Student profile details
- Semester-wise subject marks + grades + credits + SGPA
- An analytics dashboard with charts and summary cards

> Note: Please ignore the `.ipynb` notebook in the repository root.  
> The Results Analytics project lives inside the `results-analytics/` folder.

---

# Project Location

The application is located here:

- `results-analytics/`

Key files/folders you'll interact with:

- `results-analytics/src/` → React UI + analytics logic
- `results-analytics/api/` → Serverless API proxy used in production (Vercel)
- `results-analytics/vite.config.js` → Local dev proxy to avoid CORS issues
- `results-analytics/vercel.json` → SPA rewrite routing config for Vercel

---

# What the App Does (User Journey)

### 1) Enter a roll number
The home screen provides an input (example placeholder: `237W1A0501`).

### 2) Fetch academic results from the API
When the user clicks **Get Analytics** (or presses Enter), the app calls a helper function:

- `fetchAcademicResult(rollNumber)` from `src/services/api`

The UI handles:
- Empty input validation
- Loading state ("Fetching…")
- Error states:
  - API errors (status code + message)
  - Network errors
  - Unexpected errors
- "No results found" case (if the response doesn't contain student identifiers like `name` or `rollNumber`)

### 3) Render semester-wise results tables
If results are returned, the app displays:
- Student Info card (`StudentInfo`)
- A list of semester tables (`SemesterTable`) that can collapse/expand

Each semester table shows subject rows:
- Subject Code, Subject Name
- Internal, External, Total
- Grade, Credits  
And a footer SGPA indicator (or "N/A" if missing).

### 4) Show Analytics Dashboard (charts + summary)
If semester data exists, the app renders a dashboard section with:
- Summary cards (CGPA, best/worst semester, top/weakest subject, total credits)
- Multiple charts:
  - SGPA trend
  - Grade distribution
  - Subject performance
  - Semester comparison
  - Internal vs External comparison

The analytics summary is computed from the `semesters` array (credit-weighting and best/worst computations happen in utility functions).

---

# How the Frontend is Structured

## Entry point
- `results-analytics/src/main.jsx` mounts the React app into the DOM.

## Main UI container
- `results-analytics/src/App.jsx` is the primary component that:
  - Stores state (`rollNumber`, `loading`, `error`, `result`)
  - Calls the API via `fetchAcademicResult`
  - Splits UI rendering into:
    - Student info section
    - Semester tables
    - Analytics dashboard (summary + charts)

## Components
From `App.jsx`, the app composes:

- `src/components/StudentInfo.jsx`
  - Renders student fields like: Name, Roll Number, College Code, Father Name, College Name, Branch
- `src/components/SemesterTable.jsx`
  - Displays per-semester subject breakdown and SGPA
  - Supports collapsing/expanding a semester
- `src/components/AnalyticsSummary.jsx`
  - Builds summary cards using analytics helper functions:
    - credit-weighted CGPA
    - best/worst semesters
    - top/weakest subjects
    - total earned credits

Charts are imported from:
- `src/components/charts/...` (used in `App.jsx`)

---

# Data Model (Expected Shape)

The UI expects a result object shaped roughly like:

- `result.name`
- `result.rollNumber`
- `result.collegeCode`, `result.collegeName`
- `result.fatherName`
- `result.branch`
- `result.semesters` → array of semesters

Each semester object roughly includes:
- `semester` (or similar label)
- `sgpa`
- `subjects` → array of subjects

Each subject row typically includes:
- `subjectCode`
- `subjectName`
- `internalMarks`
- `externalMarks`
- `totalMarks`
- `grade`
- `credits`

---

# How API Calls Work (Dev vs Production)

This project intentionally avoids browser CORS issues using different approaches in dev and production.

## Local development (Vite proxy)
In dev, the app uses Vite's proxy configuration:

- `results-analytics/vite.config.js`

Proxy rule:
- Requests starting with `/jntuhresults` are forwarded to:
  - `https://jntuhresults.dhethi.com`
- The prefix `/jntuhresults` is rewritten away before sending upstream.

So during local dev, your frontend can call something like:
- `/jntuhresults/api/getAcademicResult?rollNumber=...`

…and Vite will forward it correctly.

## Production (Vercel serverless function proxy)
In production, the project uses a serverless function:

- `results-analytics/api/getAcademicResult.js`

Behavior:
- Only allows `GET` requests
- Requires a `rollNumber` query param
- Calls the upstream API:
  - `https://jntuhresults.dhethi.com/api/getAcademicResult?rollNumber=...`
- Returns the upstream status code + JSON
- If upstream sends non-JSON, it safely wraps it into a JSON `{ message: ... }`
- If upstream fails completely, it returns `502`

So in production, your frontend calls:
- `/api/getAcademicResult?rollNumber=...`

## SPA routing rewrites (Vercel)
- `results-analytics/vercel.json` rewrites all non-API routes to `/index.html`  
This ensures React SPA routes don't 404 on refresh.

---

# Tech Stack

Frontend:
- React 18 + Vite
- Tailwind CSS (styling)
- Chart.js + react-chartjs-2 (charts)
- Axios (HTTP requests)
- Vercel Analytics (`@vercel/analytics`)

---

# Run Locally

From repository root:

```bash
cd results-analytics
npm install
npm run dev
```

Then open:
- http://localhost:5173

---

# Deployment (Vercel)

This project is designed to deploy cleanly on Vercel:

1. Push your repo to GitHub
2. In Vercel → **Add New Project**
3. Import `aadeshshukla/AI-COLAB`
4. Set **Root Directory** = `results-analytics`
5. Keep defaults:
   - Build: `npm run build`
   - Output: `dist`
6. Deploy

The production app will use:
- `/api/getAcademicResult` (serverless proxy)

---

# Notes / Troubleshooting

- If local dev fetch fails, verify you're calling the dev proxy path that starts with `/jntuhresults`.
- If production fetch fails, verify the deployed Vercel function is reachable at `/api/getAcademicResult`.
- The app shows specific error messages for:
  - API errors (status code)
  - Network failures
  - Invalid/empty results

---

## Author
Developed by Aadesh Shukla
