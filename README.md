# Billing Map - React Frontend

This is the modern React frontend for the Billing System, replacing the legacy `modern-map.html`.

## 🚀 Quick Start

**Important**: You must be in the `03_Frontend_App` directory to run commands.

```powershell
# 1. Enter the directory
cd "03_Frontend_App"

# 2. Install dependencies (First time only)
npm install

# 3. Start the Development Server
npm run dev
```

## 🛠 Features

*   **Vite + React 18**: Fast development server.
*   **Supabase**: Connects to the hosted database for real-time data.
*   **Leaflet Map**: Handles 70,000+ points with clustering.
*   **TailwindCSS**: Mobile-first, dark mode design.

## 📁 Structure

*   `src/components/Map.jsx`: The main map logic.
*   `src/components/Sidebar.jsx`: Search and filtering.
*   `src/lib/supabaseClient.js`: Database connection.
