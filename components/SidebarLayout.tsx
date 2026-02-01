"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SIDEBAR_ACTIVE = "sloanex_sidebar_active";
const SIDEBAR_RESET = "sloanex_sidebar_reset";

type Props = {
  active: "account" | "subscription" | "support";
  children: React.ReactNode;
  showBack?: boolean;
};

export default function SidebarLayout({ active, children, showBack }: Props) {
  const router = useRouter();
  const [activeButton, setActiveButton] = useState(active);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_ACTIVE, active);
  }, [active]);

  const navigate = (path: string, key: string) => {
    setActiveButton(key as typeof active);
    localStorage.setItem(SIDEBAR_ACTIVE, key);
    router.push(path);
  };

  const goBack = () => {
    localStorage.setItem(SIDEBAR_RESET, "true");
    localStorage.removeItem(SIDEBAR_ACTIVE);
    router.push("/exclusive");
  };

  return (
    <div className="exclusive-layout">
      <aside className="sidebar">
        <button
          className={`button ${activeButton === "account" ? "pink" : ""}`}
          onClick={() => navigate("/account", "account")}
        >
          Account
        </button>
        <button
          className={`button ${activeButton === "subscription" ? "pink" : ""}`}
          onClick={() => navigate("/subscription", "subscription")}
        >
          Subscription
        </button>
        <button
          className={`button ${activeButton === "support" ? "pink" : ""}`}
          onClick={() => navigate("/support", "support")}
        >
          Support
        </button>
        {showBack && (
          <button className="button" onClick={goBack}>
            Back
          </button>
        )}
      </aside>
      <section style={{ padding: "24px" }}>{children}</section>
    </div>
  );
}
