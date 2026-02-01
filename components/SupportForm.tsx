"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const SIDEBAR_RESET = "sloanex_sidebar_reset";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function SupportForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonPink, setButtonPink] = useState(false);

  const words = useMemo(() => wordCount(description), [description]);
  const valid =
    name.trim().length > 1 &&
    /.+@.+\..+/.test(email) &&
    words > 0 &&
    words <= 200;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setButtonPink(true);
    setError(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, description, honeypot })
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Unable to send message");
      }
      localStorage.setItem(SIDEBAR_RESET, "true");
      router.push("/exclusive");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message");
      setButtonPink(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <h1 style={{ color: "var(--pink)", marginTop: 0 }}>Support</h1>
      <label style={{ display: "block", marginBottom: 12 }}>
        Name
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          style={{
            width: "100%",
            marginTop: 6,
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.2)",
            color: "var(--text)"
          }}
        />
      </label>
      <label style={{ display: "block", marginBottom: 12 }}>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{
            width: "100%",
            marginTop: 6,
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.2)",
            color: "var(--text)"
          }}
        />
      </label>
      <label style={{ display: "block", marginBottom: 12 }}>
        Description (max 200 words)
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={6}
          style={{
            width: "100%",
            marginTop: 6,
            padding: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.2)",
            color: "var(--text)"
          }}
        />
        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          {words} / 200 words
        </div>
      </label>

      <label style={{ display: "none" }}>
        Leave this field empty
        <input
          type="text"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </label>

      {error && <p style={{ color: "var(--pink)" }}>{error}</p>}

      <button
        type="submit"
        className={`button ${buttonPink ? "pink" : ""}`}
        disabled={!valid || submitting}
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
