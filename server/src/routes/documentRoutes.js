const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { optionalAuth, protect } = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
} = require("../controllers/documentController");

// Guest OR logged-in can upload
router.post("/upload", optionalAuth, upload.single("pdf"), uploadDocument);

// Only logged-in users see their saved document list
router.get("/", protect, getMyDocuments);

router.get("/:id", optionalAuth, getDocumentById);

module.exports = router;
