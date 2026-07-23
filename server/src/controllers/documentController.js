// Document controllers - upload PDF (guest or logged-in)

const path = require("path");
const crypto = require("crypto");
const Document = require("../models/Document");

// AI service base URL (FastAPI)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// POST /api/documents/upload
// Works for BOTH guests and logged-in users
const uploadDocument = async (req, res) => {
  try {
    // Multer puts the file on req.file
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    // Unique key for this document (used by FAISS folder)
    const docKey = crypto.randomBytes(12).toString("hex");

    // Guest id comes from frontend header (or we create one)
    const guestId = req.user ? null : req.headers["x-guest-id"] || docKey;

    const document = await Document.create({
      userId: req.user ? req.user._id : null,
      guestId: req.user ? null : guestId,
      originalName: req.file.originalname,
      filePath: req.file.path,
      docKey,
      isProcessed: false,
    });

    // Absolute path so FastAPI can open the PDF
    const absolutePath = path.resolve(req.file.path);

    // Ask FastAPI to extract text + make embeddings + save FAISS
    let aiResponse;
    try {
      aiResponse = await fetch(`${AI_SERVICE_URL}/process-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: absolutePath,
          doc_id: docKey,
        }),
      });
    } catch (fetchError) {
      // AI service not running / wrong URL
      console.error("AI service unreachable:", fetchError.message);
      return res.status(503).json({
        message:
          "AI service is not running. Start uvicorn on port 8000, then try again.",
        document: {
          _id: document._id,
          originalName: document.originalName,
          docKey: document.docKey,
          isProcessed: false,
          guestId: document.guestId,
        },
      });
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI process-pdf failed:", errText);
      return res.status(500).json({
        message: "PDF uploaded but AI processing failed",
        document,
      });
    }

    // Mark as processed
    document.isProcessed = true;
    await document.save();

    res.status(201).json({
      message: "PDF uploaded and processed successfully",
      document: {
        _id: document._id,
        originalName: document.originalName,
        docKey: document.docKey,
        isProcessed: document.isProcessed,
        guestId: document.guestId,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clearer Mongo Atlas / network errors
    if (
      error.name === "MongoServerSelectionError" ||
      error.name === "MongoNetworkError"
    ) {
      return res.status(503).json({
        message:
          "Cannot reach MongoDB Atlas. Check internet, MONGO_URI, and Atlas Network Access (IP allowlist).",
      });
    }

    res.status(500).json({ message: "Server error during upload" });
  }
};

// GET /api/documents - only for logged-in users (their saved PDFs)
const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ message: "Server error fetching documents" });
  }
};

// GET /api/documents/:id
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Logged-in user can only open their own doc
    // Guest can open if guestId matches header
    if (req.user) {
      if (
        document.userId &&
        document.userId.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "Not allowed" });
      }
    } else {
      const guestId = req.headers["x-guest-id"];
      if (!guestId || document.guestId !== guestId) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    res.json({ document });
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({ message: "Server error fetching document" });
  }
};

module.exports = { uploadDocument, getMyDocuments, getDocumentById };
