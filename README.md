# LostX – Campus Lost & Found System

LostX is a full-stack, privacy-first Lost & Found web application designed for campus communities. It features automated rule-based matching (category, location, date proximity, and keyword overlap) and a confidential verification claim flow.

---

## 🌟 Core Features

- **Authentication & Roles**: Secure JWT authentication with role-based authorization (`user` & `admin`).
- **Lost & Found Reporting**: Create lost or found reports with photo uploads (up to 2MB).
- **Rule-Based Match Engine**: Automatically computes match scores (up to 100) between new reports and candidates using:
  - Exact Category (40 pts)
  - Same Campus Location (25 pts)
  - Date Proximity within 3 to 7 days (8–15 pts)
  - Keyword overlap in title and description (up to 20 pts)
  - Automatic creation of match suggestions and user notifications when score ≥ 60.
- **Privacy Shield & Handover Protection**:
  - Found item reporters set a secret **Private Detail** (e.g. lockscreen wallpaper, engravings, serial number) and a **Handover Location**.
  - Private details and handover locations are stripped from public responses and strictly guarded.
- **Claims Verification Queue**:
  - Claimants submit proof descriptions.
  - Administrators review claims side-by-side (Finder's Private Detail vs. Claimant's Proof).
  - Approving a claim transitions the item to `claimed` and reveals the handover spot to the claimant.
- **Admin Control Center**:
  - Review claims queue (approve/reject with custom feedback notes).
  - Mark recovered items (`recovered`).
  - View real-time platform statistics (Users, Lost, Found, Recovered, Pending Claims, Matches).
- **Polling Notifications**:
  - In-app notification center with 30-second polling for updates and match suggestions.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs |
| **File Storage** | Multer (`/uploads` directory with static Express serving) |

---

## 📁 Project Structure

```
LostX/
├── plan.md                     # Original MVP specification
├── package.json                # Root convenience scripts
├── README.md                   # Documentation & setup guide
├── server/
│   ├── src/
│   │   ├── constants/          # Predefined campus categories & locations
│   │   ├── controllers/        # auth, items, claims, notifications, admin
│   │   ├── middleware/         # auth (JWT), adminOnly, upload (multer)
│   │   ├── models/             # User, Item, Match, Claim, Notification
│   │   ├── routes/             # Express API route modules
│   │   ├── scripts/            # seedAdmin.js, seedDemo.js
│   │   ├── services/           # matcher.js, notify.js
│   │   ├── tests/              # matcher.test.js (Unit test suite)
│   │   ├── app.js              # Express app setup, CORS, static routes
│   │   └── server.js           # Server entry point & DB connection
│   ├── uploads/                # Local uploaded item images
│   ├── package.json
│   └── .env
└── client/
    ├── src/
    │   ├── components/         # Navbar, Footer, ItemCard, FilterBar, Badge, ProtectedRoute
    │   ├── context/            # AuthContext (user state & notification polling)
    │   ├── pages/              # Home, Browse, ReportItem, ItemDetail, MyReports, MyClaims, Notifications, AdminDashboard, AdminClaims
    │   ├── api.js              # Axios instance with JWT interceptor
    │   ├── constants/          # UI enums and labels
    │   ├── App.jsx             # Router and layouts
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- MongoDB (Local instance running at `mongodb://127.0.0.1:27017` or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 2. Configure Backend Environment
Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lostx
JWT_SECRET=lostx_dev_secret_key_12345
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(If using MongoDB Atlas, replace `MONGO_URI` with your connection string).*

### 3. Seed Demo Data (Optional but Recommended)
Populate 12+ lost and found items, matches, and demo accounts:
```bash
cd server
npm run seed:demo
```
Or create an admin account only:
```bash
npm run seed:admin
```

#### Demo Accounts:
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@lostx.campus` | `Admin@12345` |
| **User (Alice)** | `alice@campus.edu` | `Password123!` |
| **User (Bob)** | `bob@campus.edu` | `Password123!` |

*(The login page also has 1-click auto-fill buttons for these accounts).*

### 4. Run the Backend Server
```bash
cd server
npm run dev
```
*API will run at `http://localhost:5000`.*

### 5. Run the Frontend Client
In a separate terminal:
```bash
cd client
npm run dev
```
*Web app will open at `http://localhost:5173`.*

---

## 🧪 Running Unit Tests

To run the unit test suite for the rule-based matcher (`services/matcher.js`):
```bash
cd server
npm test
```
All 5 test suites will run against category filtering, date bonuses, location scoring, and keyword tokenization.

---

## 📋 Definition of Done Verification Walkthrough

Follow this 6-step flow to verify full system completion:

1. **User A (Bob)** reports a **Found Wallet** at `Library` with a hidden private detail (*"Contains student ID ending in 4921"*).
2. **User B (Alice)** reports a **Lost Wallet** at `Library`.
3. **Matcher Trigger**: Both users receive in-app match notifications linking to the candidate report.
4. **Owner Claim**: Alice visits the found wallet, clicks **Claim This Item**, and submits proof (*"Fossil wallet with my student card ending in 4921"*).
5. **Admin Review**: Admin opens `/admin/claims`, compares the proof side-by-side with the finder's private detail, and clicks **Approve Claim**.
6. **Handover & Recovery**: Alice sees the handover location (*"Library Reception Desk 2"*), collects her wallet, and the Admin marks the item as **Recovered**.
