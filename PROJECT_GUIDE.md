# IntelliDocs AI — Where things are used

Beginner map of the whole project.

---

## CLIENT (`client/`)

| File | What it does |
|------|----------------|
| `src/utils/api.js` | Axios instance (`withCredentials` for cookies) |
| `src/utils/guestId.js` | Creates/stores guest id in localStorage |
| `src/store/userSlice.js` | Logged-in user in Redux |
| `src/store/documentSlice.js` | Current PDF info |
| `src/store/chatSlice.js` | Messages on screen |
| `src/store/themeSlice.js` | Light / dark theme |
| `src/pages/Home.jsx` | Landing page (Start chat / Login to save) |
| `src/pages/Chat.jsx` | Upload PDF + ask questions (guest OR user) |
| `src/pages/Login.jsx` / `Register.jsx` | Auth forms |
| `src/pages/Dashboard.jsx` | Saved PDFs (login required) |
| `src/pages/Profile.jsx` | Simple profile |
| `src/components/Body.jsx` | Layout + checks `/auth/me` on load |
| `src/components/Navbar.jsx` | Links, theme, login/logout |

**Packages used here:** React, Vite, Tailwind, React Router, Redux Toolkit, Axios, Lucide

---

## SERVER (`server/`)

| File | What it does |
|------|----------------|
| `src/app.js` | Express app start, CORS, cookies, routes |
| `src/config/db.js` | MongoDB Atlas connection |
| `src/models/User.js` | users collection |
| `src/models/Document.js` | documents collection |
| `src/models/Chat.js` | chats collection (saved history) |
| `src/middleware/authMiddleware.js` | `protect` + `optionalAuth` |
| `src/middleware/uploadMiddleware.js` | Multer PDF upload |
| `src/controllers/authController.js` | register / login / logout / me |
| `src/controllers/documentController.js` | upload + call AI process-pdf |
| `src/controllers/chatController.js` | ask AI; save only if logged in |
| `src/routes/*.js` | Wire URLs to controllers |

**Packages used here:** Express, Mongoose, JWT, cookie-parser, cors, bcrypt, validator, multer, dotenv

### API list
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `POST /api/documents/upload` (guest or user)
- `GET  /api/documents` (user only)
- `POST /api/chat/ask` (guest or user; save only if user)
- `GET  /api/chat/:documentId` (user only)

---

## AI SERVICE (`ai-service/`)

| Piece | What it does |
|-------|----------------|
| `main.py` `/process-pdf` | PDF → text (PyMuPDF) → chunks → embeddings → FAISS |
| `main.py` `/ask` | question embedding → FAISS search → Gemini answer |
| `storage/<doc_id>/` | Saved `index.faiss` + `chunks.pkl` |
| `requirements.txt` | Locked Python packages |

**Packages used here:** FastAPI, uvicorn, PyMuPDF, sentence-transformers, faiss-cpu, google-generativeai, python-dotenv, python-multipart

---

## Guest vs Login (product rule)

1. **Guest:** upload + chat works. History is NOT saved in MongoDB `chats`.
2. **Login:** same upload + chat, PLUS messages saved in `chats`, docs listed on Dashboard.

Guest id header: `x-guest-id` (from `localStorage`).

---

## Run order (all 3)

1. Start **ai-service** on port 8000  
2. Start **server** on port 5000  
3. Start **client** on port 5173  
