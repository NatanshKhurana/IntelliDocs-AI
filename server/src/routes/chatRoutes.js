const express = require("express");
const router = express.Router();
const { optionalAuth, protect } = require("../middleware/authMiddleware");
const { askQuestion, getChatHistory } = require("../controllers/chatController");

// Guest OR logged-in can ask
router.post("/ask", optionalAuth, askQuestion);

// History only for logged-in users
router.get("/:documentId", protect, getChatHistory);

module.exports = router;
