"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type MediaItem = {
  id: string;
  url: string;
  type: "image" | "video";
  createdAt: string;
};

type MediaResponse = {
  images: MediaItem[];
  videos: MediaItem[];
};

const SIDEBAR_ACTIVE = "sloanex_sidebar_active";
const SIDEBAR_RESET = "sloanex_sidebar_reset";

export default function ExclusiveClient() {
  const [data, setData] = useState<MediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [collapseClicked, setCollapseClicked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const reset = localStorage.getItem(SIDEBAR_RESET);
    if (reset) {
      localStorage.removeItem(SIDEBAR_RESET);
      localStorage.removeItem(SIDEBAR_ACTIVE);
      setActiveButton(null);
    }
    fetch("/api/media")
      .then((res) => res.json())
      .then((payload) => {
        setData({ images: payload.images, videos: payload.videos });
      })
      .catch(() => setError("Unable to load media."))
      .finally(() => setLoading(false));
  }, []);

  const handleNavigate = (path: string, key: string) => {
    setActiveButton(key);
    localStorage.setItem(SIDEBAR_ACTIVE, key);
    router.push(path);
  };

  const openLightbox = (item: MediaItem) => {
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    setLightbox(item);
  };

  const closeLightbox = () => {
    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, parseInt(scrollY || "0") * -1);
    setLightbox(null);
    setCollapseClicked(false);
  };

  return (
    <div className="exclusive-layout">
      <aside className="sidebar">
        <button
          className={`button ${activeButton === "account" ? "pink" : ""}`}
          onClick={() => handleNavigate("/account", "account")}
        >
          Account
        </button>
        <button
          className={`button ${activeButton === "subscription" ? "pink" : ""}`}
          onClick={() => handleNavigate("/subscription", "subscription")}
        >
          Subscription
        </button>
        <button
          className={`button ${activeButton === "support" ? "pink" : ""}`}
          onClick={() => handleNavigate("/support", "support")}
        >
          Support
        </button>
      </aside>
      <section style={{ padding: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px"
          }}
        >
          <div>
            <h2 style={{ color: "var(--pink)", marginTop: 0 }}>Images</h2>
            {loading && <p>Loading images...</p>}
            {error && <p>{error}</p>}
            <div className="column-grid">
              {data?.images.map((item) => (
                <div key={item.id} className="media-card">
                  <button
                    className="button"
                    style={{
                      padding: 0,
                      background: "transparent",
                      borderRadius: 12,
                      width: "100%"
                    }}
                    onClick={() => openLightbox(item)}
                    aria-label="Expand image"
                  >
                    <img
                      src={item.url}
                      alt="Exclusive content"
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "contain"
                      }}
                      loading="lazy"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ color: "var(--pink)", marginTop: 0 }}>Videos</h2>
            {loading && <p>Loading videos...</p>}
            {error && <p>{error}</p>}
            <div className="column-grid">
              {data?.videos.map((item) => (
                <div key={item.id} className="media-card">
                  <button
                    className="button"
                    style={{
                      padding: 0,
                      background: "transparent",
                      borderRadius: 12,
                      width: "100%"
                    }}
                    onClick={() => openLightbox(item)}
                    aria-label="Expand video"
                  >
                    <video
                      src={item.url}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "contain"
                      }}
                      preload="metadata"
                      muted
                      playsInline
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <div style={{ textAlign: "center" }}>
            <button
              className={`button ${collapseClicked ? "pink" : ""}`}
              onClick={() => {
                setCollapseClicked(true);
                setTimeout(() => closeLightbox(), 150);
              }}
            >
              Click To Collapse
            </button>
            <div className="lightbox-content" style={{ marginTop: "16px" }}>
              {lightbox.type === "image" ? (
                <img
                  src={lightbox.url}
                  alt="Expanded content"
                  style={{ maxWidth: "100%", maxHeight: "70vh" }}
                />
              ) : (
                <video
                  src={lightbox.url}
                  controls
                  autoPlay
                  playsInline
                  style={{ maxWidth: "100%", maxHeight: "70vh" }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
