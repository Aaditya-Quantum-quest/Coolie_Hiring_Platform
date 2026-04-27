# Coolie Hiring App — Backend API

Node.js + Express + PostgreSQL backend with JWT authentication.

## Setup

### 1. Fill in `.env`
Open `.env` and set your PostgreSQL credentials:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cooliehire
JWT_SECRET=your_very_long_random_secret_here
```

### 2. Create the Database in PostgreSQL
Open **pgAdmin** or **psql** and run:
```sql
CREATE DATABASE cooliehire;
```
Then run the schema:
```sql
-- Connect to cooliehire DB, then run:
\i src/config/schema.sql
```
Or copy-paste the contents of `src/config/schema.sql` into pgAdmin Query Tool.

### 3. Install & Start
```bash
npm install
npm run dev
```

Server runs at: **https://coolie-hiring-platform.onrender.com**

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/customer/register` | ❌ | Customer signup |
| POST | `/api/auth/customer/login` | ❌ | Customer login |
| POST | `/api/auth/coolie/register` | ❌ | Coolie signup (multipart + uploads) |
| POST | `/api/auth/coolie/login` | ❌ | Coolie login |
| GET | `/api/auth/me` | ✅ Cookie | Get current user |
| POST | `/api/auth/refresh` | 🍪 Refresh | Refresh access token |
| POST | `/api/auth/logout` | ✅ Cookie | Logout |
| GET | `/api/health` | ❌ | Health check |

---

## Coolie Registration — Required Uploads

Send as `multipart/form-data`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `passport_photo` | image (JPG/PNG) | ✅ | Passport size photo |
| `aadhaar_front` | image/PDF | ✅ | Aadhaar card — front side |
| `aadhaar_back` | image/PDF | ✅ | Aadhaar card — back side |
| `secondary_doc` | image/PDF | ✅ | Voter ID / PAN / Driving License / Passport |

---

## Folder Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── db.js           PostgreSQL pool
│   │   ├── multer.js       File upload config
│   │   └── schema.sql      DB schema
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validate.middleware.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── services/
│   │   └── auth.service.js
│   ├── validators/
│   │   └── auth.validator.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── index.js            Entry point
├── uploads/                Auto-created on first upload
│   ├── passport_photos/
│   ├── aadhaar/
│   └── secondary_docs/
├── .env                    ← Fill your credentials here!
└── package.json
```
