import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { FileText, MessageSquare } from "lucide-react";
import api from "@/utils/api";
import { setDocument } from "@/store/documentSlice";
import { clearMessages } from "@/store/chatSlice";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Protect this page - only logged-in users
  useEffect(() => {
    if (user === null) {
      // wait a moment - Body may still be loading /me
    }
  }, [user]);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/documents");
        setDocuments(res.data.documents || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user]);

  const openChat = (doc) => {
    dispatch(
      setDocument({
        _id: doc._id,
        originalName: doc.originalName,
        docKey: doc.docKey,
        isProcessed: doc.isProcessed,
        guestId: doc.guestId,
      })
    );
    dispatch(clearMessages());
    navigate("/chat");
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold">Login required</h1>
        <p className="mt-2 text-muted-foreground">
          Dashboard shows your saved PDFs and chats. Guest users can use{" "}
          <Link to="/chat" className="text-primary hover:underline">
            temporary chat
          </Link>{" "}
          without an account.
        </p>
        <Button className="mt-6" render={<Link to="/login" />}>
          Login
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome, {user.name}. Your saved documents are listed below.
          </p>
        </div>
        <Button render={<Link to="/chat" />}>
          <MessageSquare className="size-4" />
          New chat
        </Button>
      </div>

      {loading && (
        <p className="mt-8 text-sm text-muted-foreground">Loading documents...</p>
      )}
      {error && (
        <p className="mt-8 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!loading && documents.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
          <FileText className="mx-auto size-8 text-primary" />
          <p className="mt-3 font-medium">No saved PDFs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PDF while logged in to see it here.
          </p>
          <Button className="mt-4" render={<Link to="/chat" />}>
            Go to chat
          </Button>
        </div>
      )}

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {documents.map((doc) => (
          <li key={doc._id}>
            <button
              type="button"
              onClick={() => openChat(doc)}
              className="flex w-full items-start gap-3 rounded-xl border border-border bg-card/50 p-4 text-left transition-colors hover:bg-accent/40"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <FileText className="size-5" />
              </span>
              <span>
                <span className="block font-medium">{doc.originalName}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {doc.isProcessed ? "Ready" : "Processing"} ·{" "}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Dashboard;
