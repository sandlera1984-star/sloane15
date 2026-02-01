"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Settings = {
  bannerUrl?: string | null;
  profileUrl?: string | null;
};

const TERMS_KEY = "sloanex_terms_accepted";
const AGE_KEY = "sloanex_age_confirmed";

export default function HomeClient({ settings }: { settings: Settings }) {
  const [showTerms, setShowTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [showConstruction, setShowConstruction] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedAgreed = localStorage.getItem(TERMS_KEY) === "true";
    const storedAge = localStorage.getItem(AGE_KEY) === "true";
    setAgreed(storedAgreed);
    setAgeConfirmed(storedAge);
    setShowTerms(!(storedAgreed && storedAge));
  }, []);

  useEffect(() => {
    if (showTerms) {
      setTimeout(() => {
        scrollRef.current?.focus();
      }, 0);
    }
  }, [showTerms]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setScrolledBottom(isBottom);
  };

  const handleAgree = () => {
    setAgreed(true);
    localStorage.setItem(TERMS_KEY, "true");
  };

  const handleAge = () => {
    setAgeConfirmed(true);
    localStorage.setItem(AGE_KEY, "true");
  };

  const closeTerms = () => {
    if (agreed && ageConfirmed) {
      setShowTerms(false);
    }
  };

  const bannerUrl = settings.bannerUrl || "";
  const profileUrl = settings.profileUrl || "";

  return (
    <div style={{ padding: "32px" }}>
      <section
        className="card"
        style={{
          position: "relative",
          padding: "24px",
          minHeight: "70vh",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.08)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt="SloaneX banner"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 900px) 100vw, 80vw"
              priority
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #7c3aed, #ff4fd8)"
              }}
            />
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "6px solid rgba(255,255,255,0.5)",
            overflow: "hidden",
            background: "rgba(255,255,255,0.1)"
          }}
        >
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt="SloaneX profile"
              fill
              style={{ objectFit: "cover" }}
              sizes="160px"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #ff4fd8, #7c3aed)"
              }}
            />
          )}
        </div>

        <div style={{ marginTop: "32px" }}>
          <h1
            style={{
              fontSize: "3rem",
              color: "var(--pink)",
              fontWeight: 800,
              margin: "24px 0 8px",
              maxWidth: "420px"
            }}
          >
            SloaneX
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: "1.2rem" }}>
            Sign Up For Exclusive Content
          </p>
          <button
            type="button"
            className="button"
            onClick={() => setShowConstruction(true)}
          >
            5 CAD billed monthly
          </button>
        </div>

        {showConstruction && (
          <div
            className="modal-backdrop"
            onClick={() => setShowConstruction(false)}
            role="presentation"
          >
            <button
              type="button"
              onClick={() => setShowConstruction(false)}
              className="button"
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "var(--purple)",
                color: "var(--pink)",
                fontSize: "1.1rem"
              }}
              aria-label="Under construction"
            >
              Under Construction
            </button>
          </div>
        )}
      </section>

      <footer style={{ marginTop: "24px" }}>
        <button
          type="button"
          onClick={() => setShowTerms(true)}
          className="button"
          style={{ background: "transparent", color: "var(--muted)" }}
        >
          View Terms
        </button>
      </footer>

      {showTerms && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal" aria-labelledby="terms-title">
            <h2 id="terms-title" style={{ color: "var(--pink)" }}>
              Terms of Agreement
            </h2>
            <div
              className="scroll-box"
              ref={scrollRef}
              onScroll={handleScroll}
              tabIndex={0}
              aria-label="Terms of Agreement content"
            >
              <p>
                Welcome to SloaneX. By accessing this service, you agree to use
                the site responsibly and respectfully. You may not upload,
                distribute, or access content that violates applicable laws,
                infringes on intellectual property rights, or harms other users.
              </p>
              <p>
                This platform provides curated digital content. All content is
                provided “as is” without warranties of any kind. We are not
                liable for any damages or losses arising from your access or use
                of the service.
              </p>
              <p>
                We collect only the information needed to deliver the service and
                respond to support requests. We do not sell personal data, and
                we store minimal information to keep your experience secure.
              </p>
              <p>
                You agree not to attempt to bypass security, access restricted
                areas without authorization, or misuse the service in any way.
                If you have questions or concerns, contact support using the
                provided form.
              </p>
              <p>
                By proceeding, you confirm that you understand these terms and
                will comply with the acceptable use rules and privacy practices
                outlined above.
              </p>
            </div>
            {scrolledBottom && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`button ${agreed ? "pink" : ""}`}
                  onClick={handleAgree}
                >
                  Agree
                </button>
                <button
                  type="button"
                  className={`button ${ageConfirmed ? "pink" : ""}`}
                  onClick={handleAge}
                >
                  I Am Over 18 Years Old
                </button>
              </div>
            )}
            {agreed && ageConfirmed && (
              <div style={{ marginTop: "16px" }}>
                <button type="button" className="button" onClick={closeTerms}>
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
