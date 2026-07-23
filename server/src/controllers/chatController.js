// Chat controllers
// - Guest: ask question, get answer, DO NOT save history
// - Logged-in: ask question, get answer, SAVE history in MongoDB

const Document = require("../models/Document");
const Chat = require("../models/Chat");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// POST /api/chat/ask
const askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question || !question.trim()) {
      return res
        .status(400)
        .json({ message: "documentId and question are required" });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!document.isProcessed) {
      return res
        .status(400)
        .json({ message: "Document is still processing. Try again soon." });
    }

    // Permission check
    if (req.user) {
      // Owner OR guest doc they somehow use - allow owner's docs
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

    // Call FastAPI /ask
    let aiResponse;
    try {
      aiResponse = await fetch(`${AI_SERVICE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_id: document.docKey,
          question: question.trim(),
        }),
      });
    } catch (fetchError) {
      console.error("AI service unreachable:", fetchError.message);
      return res.status(503).json({
        message:
          "AI service is not running. Start uvicorn on port 8000, then try again.",
      });
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI ask failed:", errText);
      return res.status(502).json({
        message:
          "AI service failed to answer. Check Gemini API quota/key, or try again later.",
      });
    }

    const aiData = await aiResponse.json();
    const answer = aiData.answer || "No answer returned";

    // ONLY save chat if user is logged in
    if (req.user) {
      let chat = await Chat.findOne({
        userId: req.user._id,
        documentId: document._id,
      });

      if (!chat) {
        chat = await Chat.create({
          userId: req.user._id,
          documentId: document._id,
          messages: [],
        });
      }

      chat.messages.push({ role: "user", content: question.trim() });
      chat.messages.push({ role: "assistant", content: answer });
      await chat.save();
    }

    res.json({
      answer,
      saved: Boolean(req.user), // frontend can show "login to save"
    });
  } catch (error) {
    console.error("Ask error:", error);
    res.status(500).json({ message: "Server error while asking question" });
  }
};

// GET /api/chat/:documentId - history only for logged-in users
const getChatHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Login required for chat history" });
    }

    const chat = await Chat.findOne({
      userId: req.user._id,
      documentId: req.params.documentId,
    });

    res.json({
      messages: chat ? chat.messages : [],
    });
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ message: "Server error fetching chat history" });
  }
};

module.exports = { askQuestion, getChatHistory };
