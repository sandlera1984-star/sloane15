"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MediaItem } from "./ExclusiveClient";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

type MediaResponse = {
  images: MediaItem[];
  videos: MediaItem[];
  settings: {
    bannerUrl: string | null;
    profileUrl: string | null;
  };
};

type UploadStatus = {
  progress: number;
  seconds: number;
  complete: boolean;
  error?: string | null;
};

function useUploadStatus() {
  const [status, setStatus] = useState<UploadStatus>({
    progress: 0,
    seconds: 0,
    complete: false,
    error: null
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStatus({ progress: 0, seconds: 0, complete: false, error: null });
  };

  const start = () => {
    reset();
    timerRef.current = setInterval(() => {
      setStatus((prev) => ({ ...prev, seconds: prev.seconds + 1 }));
    }, 1000);
  };

  const updateProgress = (progress: number) => {
    setStatus((prev) => ({ ...prev, progress }));
  };

  const finish = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStatus((prev) => ({ ...prev, complete: true }));
  };

  const setError = (error: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStatus((prev) => ({ ...prev, error }));
  };

  return { status, reset, start, updateProgress, finish, setError };
}

function UploadCard({
  title,
  kind,
  accept,
  onComplete
}: {
  title: string;
  kind: "banner" | "profile" | "image" | "video";
  accept: string;
  onComplete: () => void;
}) {
  const { status, reset, start, updateProgress, finish, setError } =
    useUploadStatus();

  const handleUpload = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Please upload a file under 50MB.");
      return;
    }

    start();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        updateProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        finish();
        onComplete();
      } else {
        setError("Upload failed. Please try again.");
      }
    };
    xhr.onerror = () => setError("Upload failed. Please try again.");
    xhr.send(formData);
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      reset();
      handleUpload(file);
    }
  };

  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      reset();
      handleUpload(file);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, color: "var(--pink)" }}>{title}</h3>
      <label
        style={{
          border: "2px dashed rgba(255,255,255,0.2)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
          display: "block",
          cursor: "pointer"
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        Drag & drop or click to upload
        <input type="file" accept={accept} hidden onChange={onFileChange} />
      </label>
      <div style={{ marginTop: 12 }}>
        <div className="progress-bar">
          <span style={{ width: `${status.progress}%` }} />
        </div>
        <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
          {status.complete ? (
            <span style={{ color: "var(--green)" }}>Complete</span>
          ) : (
            <span>{status.seconds}s</span>
          )}
        </div>
        {status.error && (
          <p style={{ color: "var(--pink)", marginTop: 8 }}>{status.error}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminClient({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [buttonPink, setButtonPink] = useState(false);
  const [data, setData] = useState<MediaResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirm, setConfirm] = useState<MediaItem | null>(null);
  const [deletePink, setDeletePink] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<MediaItem | null>(null);

  const fetchData = async () => {
    setRefreshing(true);
    const res = await fetch("/api/media");
    const payload = await res.json();
    setData(payload);
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setButtonPink(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Login failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setButtonPink(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    setDeletePink(item.id);
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, kind: item.type })
    });
    if (!res.ok) {
      setError("Delete failed. Please try again.");
      setDeletePink(null);
      return;
    }
    setConfirm(null);
    setDeletePink(null);
    fetchData();
  };

  const mediaItems = useMemo(() => {
    if (!data) return [];
    return [...data.images, ...data.videos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);

  if (!isAdmin) {
    return (
      <div style={{ padding: "32px" }}>
        <div className="modal-backdrop">
          <div className="modal">
            <h2 style={{ color: "var(--pink)" }}>Enter Admin Code</h2>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.2)",
                  color: "var(--text)",
                  marginBottom: 12
                }}
                required
              />
              {error && <p style={{ color: "var(--pink)" }}>{error}</p>}
              <button
                type="submit"
                className={`button ${buttonPink ? "pink" : ""}`}
                disabled={loading}
              >
                {loading ? "Checking..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      <section className="upload-grid" style={{ marginBottom: 32 }}>
        <UploadCard
          title="Profile Picture"
          kind="profile"
          accept="image/*"
          onComplete={fetchData}
        />
        <UploadCard
          title="Banner Picture"
          kind="banner"
          accept="image/*"
          onComplete={fetchData}
        />
        <UploadCard
          title="Upload Pictures"
          kind="image"
          accept="image/*"
          onComplete={fetchData}
        />
        <UploadCard
          title="Upload Video"
          kind="video"
          accept="video/*"
          onComplete={fetchData}
        />
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ marginTop: 0, color: "var(--pink)" }}>Content Library</h2>
          {refreshing && <span className="badge">Refreshing...</span>}
        </div>
        {!data && <p>Loading content...</p>}
        <div className="column-grid" style={{ maxHeight: 500, overflowY: "auto" }}>
          {mediaItems.map((item) => (
            <div key={item.id} className="media-card">
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt="Uploaded content"
                  width={320}
                  height={240}
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit: "contain"
                  }}
                />
              ) : (
                <video
                  src={item.url}
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit: "contain"
                  }}
                  preload="metadata"
                />
              )}
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {item.type === "video" && (
                  <button
                    className={`button ${
                      videoPreview?.id === item.id ? "pink" : ""
                    }`}
                    onClick={() => setVideoPreview(item)}
                  >
                    Play
                  </button>
                )}
                <button
                  className={`button ${deletePink === item.id ? "pink" : ""}`}
                  onClick={() => setConfirm(item)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {confirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3 style={{ color: "var(--pink)" }}>
              Are You Sure You Want To Delete This Content?
            </h3>
            {error && <p style={{ color: "var(--pink)" }}>{error}</p>}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 24
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  onChange={() => handleDelete(confirm)}
                />
                Yes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" onChange={() => setConfirm(null)} />
                No
              </label>
            </div>
          </div>
        </div>
      )}

      {videoPreview && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <button
              className="button"
              onClick={() => setVideoPreview(null)}
            >
              Close
            </button>
            <video
              src={videoPreview.url}
              controls
              autoPlay
              style={{ width: "100%", marginTop: 16 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
