"""
IntelliDocs AI Service (FastAPI)

Jobs:
1) /process-pdf  → read PDF, chunk text, make embeddings, save FAISS index
2) /ask          → embed question, search FAISS, ask Gemini with top chunks
"""

import os
import pickle
from pathlib import Path
from typing import List

import faiss
import fitz  # PyMuPDF
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from google import genai
from google.genai import errors as genai_errors
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

# Load variables from .env file
load_dotenv()

app = FastAPI(title="IntelliDocs AI Service")

# Folder where we store FAISS indexes + text chunks for each document
STORAGE_DIR = Path(__file__).parent / "storage"
STORAGE_DIR.mkdir(exist_ok=True)

# Load embedding model once when server starts (slow first time, then cached)
print("Loading embedding model: all-MiniLM-L6-v2 ...")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model ready.")

# Gemini setup (new google-genai SDK)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Prefer model from .env, then try fallbacks if quota fails
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_MODEL_FALLBACKS = [
    GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest",
]
gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)


# ---------- Request body shapes ----------

class ProcessPdfRequest(BaseModel):
    file_path: str  # absolute path to the PDF on disk
    doc_id: str  # unique id from Express


class AskRequest(BaseModel):
    doc_id: str
    question: str


# ---------- Helper functions ----------

def extract_text_from_pdf(file_path: str) -> str:
    """Read all pages from a PDF and return one big text string."""
    doc = fitz.open(file_path)
    pages = []
    for page in doc:
        pages.append(page.get_text())
    doc.close()
    return "\n".join(pages)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 80) -> List[str]:
    """
    Split long text into smaller pieces (chunks).
    Overlap helps keep meaning across chunk borders.
    """
    text = " ".join(text.split())  # clean extra spaces/newlines
    if not text:
        return []

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap
        if start < 0:
            start = 0
        # prevent infinite loop on tiny texts
        if end >= len(text):
            break
    return chunks


def get_doc_paths(doc_id: str):
    """Return file paths for this document's FAISS index and chunks."""
    folder = STORAGE_DIR / doc_id
    folder.mkdir(parents=True, exist_ok=True)
    index_path = folder / "index.faiss"
    chunks_path = folder / "chunks.pkl"
    return index_path, chunks_path


def ask_gemini(question: str, context_chunks: List[str]) -> str:
    """Send question + retrieved PDF chunks to Gemini and get an answer."""
    context = "\n\n".join(context_chunks)

    # If no API key, still return useful text from FAISS chunks
    if not gemini_client:
        return (
            "Gemini API key is missing, so here are the most relevant PDF parts:\n\n"
            + "\n---\n".join(context_chunks[:2])
        )

    prompt = f"""You are a helpful assistant for IntelliDocs AI.
Answer the user's question using ONLY the context from the PDF below.
If the answer is not in the context, say you could not find it in the document.
Keep the answer clear and beginner-friendly.

CONTEXT FROM PDF:
{context}

QUESTION:
{question}

ANSWER:"""

    # Try preferred model, then fallbacks (helps when one model has no free quota)
    last_error = None
    tried = set()
    for model_name in GEMINI_MODEL_FALLBACKS:
        if model_name in tried:
            continue
        tried.add(model_name)
        try:
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            if response.text:
                print(f"Gemini answered with model: {model_name}")
                return response.text
        except genai_errors.ClientError as e:
            last_error = e
            print(f"Gemini model '{model_name}' failed: {e}")
            # 429 = quota — try next model
            continue
        except Exception as e:
            last_error = e
            print(f"Gemini model '{model_name}' unexpected error: {e}")
            continue

    # All Gemini models failed (usually quota). Still answer from retrieved chunks.
    print(f"All Gemini models failed. Last error: {last_error}")
    return (
        "Gemini API quota/limit reached, so here is the most relevant text "
        "from your PDF (without LLM polish):\n\n"
        + "\n\n---\n\n".join(context_chunks[:3])
    )


# ---------- API routes ----------

@app.get("/")
def root():
    return {"message": "IntelliDocs AI Service is running"}


@app.post("/process-pdf")
def process_pdf(body: ProcessPdfRequest):
    """
    Flow:
    PDF → extract text → chunks → embeddings → FAISS save
    """
    if not os.path.exists(body.file_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")

    # 1) Extract text
    text = extract_text_from_pdf(body.file_path)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text found in this PDF")

    # 2) Make chunks
    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="Could not create text chunks")

    # 3) Make embeddings (vectors)
    embeddings = embed_model.encode(chunks, convert_to_numpy=True)
    embeddings = np.array(embeddings).astype("float32")

    # 4) Build FAISS index (L2 distance)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    # 5) Save index + chunks to disk
    index_path, chunks_path = get_doc_paths(body.doc_id)
    faiss.write_index(index, str(index_path))
    with open(chunks_path, "wb") as f:
        pickle.dump(chunks, f)

    return {
        "message": "PDF processed successfully",
        "doc_id": body.doc_id,
        "chunks": len(chunks),
    }


@app.post("/ask")
def ask(body: AskRequest):
    """
    Flow:
    question → embedding → FAISS search → top chunks → Gemini → answer
    """
    index_path, chunks_path = get_doc_paths(body.doc_id)

    if not index_path.exists() or not chunks_path.exists():
        raise HTTPException(
            status_code=404,
            detail="No FAISS data for this document. Process the PDF first.",
        )

    # Load saved index and chunks
    index = faiss.read_index(str(index_path))
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    # Embed the question
    question_vec = embed_model.encode([body.question], convert_to_numpy=True)
    question_vec = np.array(question_vec).astype("float32")

    # Search top 3 similar chunks
    top_k = min(3, len(chunks))
    distances, indices = index.search(question_vec, top_k)

    # Collect matching text chunks
    selected = []
    for i in indices[0]:
        if i >= 0 and i < len(chunks):
            selected.append(chunks[i])

    if not selected:
        raise HTTPException(status_code=404, detail="No relevant chunks found")

    # Ask Gemini
    answer = ask_gemini(body.question, selected)

    return {
        "answer": answer,
        "used_chunks": len(selected),
    }
