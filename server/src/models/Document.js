// Document model - one uploaded PDF

const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    // Set only when a logged-in user uploads
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Random id for guest uploads (no login)
    guestId: {
      type: String,
      default: null,
    },
    // Original file name from the user
    originalName: {
      type: String,
      required: true,
    },
    // Where the file is saved on disk
    filePath: {
      type: String,
      required: true,
    },
    // Id used by AI service / FAISS folder
    docKey: {
      type: String,
      required: true,
      unique: true,
    },
    // true after FastAPI finishes chunking + embeddings
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
