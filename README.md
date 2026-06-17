# Attacker Scraper Dashboard Application

This application acts as the attacker tool, simulating an automated data harvester seeking to aggregate public profile records. It connects to the target site via HTTP API queries and crawls details in a fast, asynchronous loop, storing them in its own database. It serves as an educational platform to demonstrate how scraping operates and how security controls mitigate data exposure.

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Recharts (Charts/Analytics), Axios
- **Backend**: Python FastAPI, Uvicorn, HTTPX (Asynchronous HTTP requests)
- **Database**: MongoDB (Local or Atlas)
- **Libraries**: Pandas (Data management)

## Folder Structure

```text
scraper-dashboard-app/
├── backend/
│   ├── main.py                    # FastAPI Backend Application Server
│   └── requirements.txt           # Python Dependencies
└── frontend/
    ├── app/                       # Next.js App Router Pages
    ├── package.json               # NPM Dependencies
    └── tsconfig.json              # TypeScript Configuration
```

## Setup & Running Instructions

### 1. Database Configuration
Ensure a local MongoDB server is active on your system (listening on default port `27017`), or retrieve your MongoDB Atlas Connection String.

Create a `.env` file in `backend/` or set variables globally:
```env
MONGODB_URI=mongodb://localhost:27017
```

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server on port `8001`:
   ```bash
   python main.py
   ```
   The backend API will run at: `http://localhost:8001`

### 3. Frontend Setup
1. Open a terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Create a local environment variables file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8001
   ```
3. Install node packages:
   ```bash
   npm install
   ```
4. Start the Next.js development server on port `3001` (to run side-by-side with target app):
   ```bash
   # On Windows:
   $env:PORT=3001; npm run dev
   # On Linux/macOS:
   PORT=3001 npm run dev
   ```
   The application will run at: `http://localhost:3001`

---

## Interactive Features & Simulation Flow

### 1. Target URL Connection
On the Landing Page, connect the scraper dashboard to the target application's API address (e.g., `http://localhost:8000`). Once connection is established, click **Enter Operations Console**.

### 2. Live Harvesting (SSE Stream)
Click **Start Collection** to launch the scraping engine. The backend will trigger a Server-Sent Events (SSE) connection streaming logs line-by-line:
1. `GET /api/users` is fetched to retrieve brief data list (100 profile IDs).
2. For each profile ID, `GET /api/users/{id}` is queried asynchronously.
3. Extracted profiles are recorded in the local scraper MongoDB collection.
4. Duration, collection speed (profiles/second), and progress updates stream in real-time.

### 3. Defense Simulation
1. Set **Protection OFF** on the dashboard header toggle. Run the scraper to watch it extract all 100 profiles cleanly in under 5 seconds.
2. Toggle **Protection ON**. Run the scraper again. The target server's bot detection and rate limiter will detect the script, blocking the connection with an active `429 Too Many Requests` or `403 Forbidden` visual error, stopping the harvester in its tracks.

### 4. Database Explorer & Export
Navigate to the **Collected Database** tab to browse the harvested database records. Search by name, company, or skills, and click **CSV Export** or **JSON Export** to download the aggregated database files.

---

## Deployment Configuration

### Frontend (Vercel)
Import the `scraper-dashboard-app/frontend` folder in Vercel. Add environment variable:
- `NEXT_PUBLIC_API_URL`: (Your deployed scraper backend url)

### Backend (Render)
Create a Render Web Service pointing to `scraper-dashboard-app/backend`:
1. Build Command: `pip install -r requirements.txt`
2. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Environment Variables:
   - `MONGODB_URI`: (Your MongoDB Atlas connection URI string)
