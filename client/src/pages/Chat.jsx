import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { FileUp, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";
import { getGuestId } from "@/utils/guestId";
import { setDocument, clearDocument } from "@/store/documentSlice";
import {
  addMessage,
  setMessages,
  setChatLoading,
  clearMessages,
} from "@/store/chatSlice";

const Chat = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const document = useSelector((state) => state.document);
  const { messages, loading } = useSelector((state) => state.chat);

  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  // Scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // If logged in and we have a document, load saved history from server
  useEffect(() => {
    const loadHistory = async () => {
      if (!user || !document?._id) return;
      try {
        const res = await api.get(`/chat/${document._id}`);
        dispatch(setMessages(res.data.messages || []));
      } catch {
        // no history yet is fine
      }
    };
    loadHistory();
  }, [user, document?._id, dispatch]);

  // Upload PDF (guest OR logged-in)
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    dispatch(clearMessages());

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      // Guest id header so server knows who owns this temp PDF
      const headers = {};
      if (!user) {
        headers["x-guest-id"] = getGuestId();
      }

      const res = await api.post("/documents/upload", formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(setDocument(res.data.document));
      // Remember guestId returned (in case server created it)
      if (res.data.document.guestId) {
        localStorage.setItem("intellidocs_guest_id", res.data.document.guestId);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
      dispatch(clearDocument());
    } finally {
      setUploading(false);
      // reset input so same file can be chosen again
      e.target.value = "";
    }
  };

  // Ask a question about the uploaded PDF
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || !document?._id || loading) return;

    const text = question.trim();
    setQuestion("");
    setError("");

    // Show user message immediately
    dispatch(addMessage({ role: "user", content: text }));
    dispatch(setChatLoading(true));

    try {
      const headers = {};
      if (!user) {
        headers["x-guest-id"] = getGuestId();
      }

      const res = await api.post(
        "/chat/ask",
        { documentId: document._id, question: text },
        { headers }
      );

      dispatch(addMessage({ role: "assistant", content: res.data.answer }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not get answer");
      dispatch(
        addMessage({
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        })
      );
    } finally {
      dispatch(setChatLoading(false));
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-6xl flex-col px-4 py-8">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {user ? "Saved session" : "Guest session"}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            {user ? "Your chat" : "Temporary chat"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user ? (
              "Answers are saved to your account for this document."
            ) : (
              <>
                Not saved after you leave.{" "}
                <Link
                  to="/login"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Login
                </Link>{" "}
                to keep history.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileUp className="size-4" />
            )}
            {uploading ? "Processing..." : "Upload PDF"}
          </Button>
        </div>
      </div>

      {document && (
        <p className="mb-3 text-sm text-muted-foreground">
          Active file:{" "}
          <span className="font-medium text-foreground">
            {document.originalName}
          </span>
        </p>
      )}

      {error && (
        <p className="mb-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Messages area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/40">
        <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6">
          {!document && messages.length === 0 && (
            <div className="flex h-full min-h-[200px] items-center justify-center text-center">
              <div className="max-w-sm">
                <p className="font-heading text-lg font-medium">
                  Upload a PDF to start
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No account needed for a temporary chat. Processing may take a
                  few seconds on first upload.
                </p>
              </div>
            </div>
          )}

          {document && messages.length === 0 && !loading && (
            <div className="flex min-h-[160px] items-center justify-center text-center text-sm text-muted-foreground">
              PDF ready. Ask a question below.
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                  : "mr-auto max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-sm text-foreground whitespace-pre-wrap"
              }
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="mr-auto flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleAsk}
          className="flex gap-2 border-t border-border p-3"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!document || uploading || loading}
            placeholder={
              document
                ? "Ask something about your PDF…"
                : "Upload a PDF first…"
            }
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />
          <Button
            type="submit"
            disabled={!document || !question.trim() || loading || uploading}
          >
            <Send className="size-4" />
            Send
          </Button>
        </form>
      </div>
    </main>
  );
};

export default Chat;
