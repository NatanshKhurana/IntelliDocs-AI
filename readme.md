# IntelliDocs AI

AI-powered PDF chat app.

- **Guest users** can upload a PDF and chat **without login** (temporary, not saved).
- **Logged-in users** can save documents + chat history in MongoDB.

## Folders

```
IntelliDocs-AI/
  client/       → React (Vite) frontend
  server/       → Express + MongoDB API
  ai-service/   → FastAPI (PDF + FAISS + Gemini)
```

---

## 1) AI Service (Python)

```bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
# source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
# Put your GEMINI_API_KEY in .env

uvicorn main:app --reload --port 8000
```

First run downloads the embedding model (`all-MiniLM-L6-v2`) — may take time.

---

## 2) Server (Node / Express)

```bash
cd server
npm install
copy .env.example .env
# Fill MONGO_URI, JWT_SECRET, CLIENT_URL, AI_SERVICE_URL

npm run dev
```

Server runs on `http://localhost:5000`

---

## 3) Client (React)

```bash
cd client
npm install
copy .env.example .env
# VITE_API_URL=http://localhost:5000/api

npm run dev
```

Open `http://localhost:5173`

---

## How the flow works

### Upload PDF
React → Express (`/api/documents/upload`) → saves file with Multer  
→ Express calls FastAPI `/process-pdf`  
→ PyMuPDF extracts text → chunks → SentenceTransformers embeddings → FAISS save

### Ask question
React → Express (`/api/chat/ask`) → FastAPI `/ask`  
→ embed question → FAISS search → top chunks → Gemini → answer  
→ If user is logged in, Express saves Q&A in `chats` collection

### Auth
Register/Login → JWT stored in **HTTP-only cookie** (like DevTinder style)

---

## Important files (where what lives)

See the long explanation in the chat / PROJECT_GUIDE below after setup.
