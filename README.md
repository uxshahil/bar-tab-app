# Bar Tab App

A high-performance, real-time bar management system consisting of a **Vue 3** frontend ("App") and a **Node.js/Express** backend ("API").

## 🚀 Getting Started

The system requires both the client application and the API server to be running.

### 1. Start the API (Backend)
Handles real-time socket connections and specialized logic.

```bash
cd bar-tab-api
npm install
npm run start
```
*   Running on: `http://localhost:3000` (default)

### 2. Start the App (Frontend)
The main user interface for bar staff and managers.

```bash
cd bar-tab-app
npm install
npm run dev:fresh
```
*   `dev:fresh` will: **Reset & Seed Database** -> **Generate Types** -> **Start Vite Server**.
*   Running on: `http://localhost:5173` (default)

### Docker / Deployment Note
Ensure your environment variables correctly point to each service. If `bar-tab-api` is in a container, `VITE_API_URL` in the frontend must be accessible from the client's browser.

---

## 🏗️ Project Structure

| Directory | Description |
| :--- | :--- |
| **`bar-tab-app`** | **Frontend**. Vue 3 + Vite + TailwindCSS + Supabase Client. |
| **`bar-tab-api`** | **Backend**. Express.js + Socket.io for real-time events. |

---

## 🔐 Credentials & Access (RBAC)

**Test User:** `johndoe19@example.com` / `password`

| Role | Access | Powers |
| :--- | :--- | :--- |
| **Admin** | System Config Only | **No Operational Access**. Cannot see tabs/drinks.Configures system settings. |
| **Bar Manager** | Full Operations | **Superuser for the Bar**. Manage Staff, Menu Prices, Tabs, Inventory. |
| **Bar Staff** | Front-of-House | **Execution**. View Menus, Manage Active Tabs, Process Orders. |

---

## ⚙️ Environment Configuration

The `bar-tab-app` requires the following `.env` variables:

```ini
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_generic_anon_key
VITE_API_URL=http://localhost:3000  # URL of the running bar-tab-api
VITE_VAT=0.15                       # Tax rate configuration
TESTING_USER_EMAIL=johndoe19@example.com
```

---

## 🛠 Technical Highlights

### ⚡ Real-Time Architecture
*   **Socket.io**: Used for instant communication between the Kitchen/Bar and the POS.
*   **Supabase Realtime**: Subscribes to database changes for live data synchronization.

### 🔄 SWR (Stale-While-Revalidate) Strategy
To ensure zero-latency interactions:
1.  **Optimistic UI**: Price updates and Tab changes reflect **instantly** in the UI.
2.  **Background Sync**: The app silently revalidates data with the server.
3.  **Smart Caching**: `useDrinksStore` and other loaders intelligently cache responses to minimize network requests.

### 🗄️ Database Seeding
The `npm run dev:fresh` command triggers a robust seeding process (`database/seed.js`), populating the system with a complete set of:
*   Mock Users (Admin, Manager, Staff)
*   Drink Categories & Glassware types
*   Full Menu content