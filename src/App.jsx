import React, { useState, useEffect, useCallback } from "react";
import { getApplications, saveApplications, getExtraGallery } from "./storage.js";

import avatar0 from "./assets/avatar_0.webp";
import avatar1 from "./assets/avatar_1.webp";
import avatar2 from "./assets/avatar_2.webp";
import avatar3 from "./assets/avatar_3.webp";
import avatar4 from "./assets/avatar_4.webp";
import avatar5 from "./assets/avatar_5.webp";
import avatar6 from "./assets/avatar_6.webp";
import avatar7 from "./assets/avatar_7.webp";
import avatar8 from "./assets/avatar_8.webp";
import avatar9 from "./assets/avatar_9.webp";
import landingBg from "./assets/landing_bg.webp";

const AVATARS = [avatar0, avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9];
const LANDING_BG = landingBg;

/* ---------- validators ---------- */
const isValidEth = (addr) => /^0x[a-fA-F0-9]{40}$/.test((addr || "").trim());

/* ---------- shared UI atoms ---------- */

function PillButton({ children, onClick, tone = "light", style, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Baloo 2', sans-serif",
        fontWeight: 700,
        fontSize: "clamp(14px, 1.6vw, 20px)",
        color: "#111",
        background: tone === "light" ? "#D9D9D9" : "#fff",
        border: "none",
        borderRadius: "16px",
        padding: "14px 22px",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: "0 6px 0 #000, 0 6px 10px rgba(0,0,0,0.35)",
        transition: "transform .12s ease, box-shadow .12s ease",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(4px)";
        e.currentTarget.style.boxShadow = "0 2px 0 #000, 0 2px 6px rgba(0,0,0,0.3)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 0 #000, 0 6px 10px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 0 #000, 0 6px 10px rgba(0,0,0,0.35)";
      }}
    >
      {children}
    </button>
  );
}

function NavBar({ page, goTo }) {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "landing", label: "Home" },
    { id: "apply", label: "Apply" },
    { id: "gallery", label: "Gallery" },
    { id: "checker", label: "Checker" },
  ];

  const handleNav = (id) => {
    goTo(id);
    setOpen(false);
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Below 680px: hide the row of pills, show a hamburger row instead.
          Clicking it reveals the same links stacked vertically. */}
      <style>{`
        .nav-links { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; padding: 14px 10px; }
        .nav-burger-row { display: none; }
        @media (max-width: 680px) {
          .nav-links { display: ${open ? "flex" : "none"}; flex-direction: column; align-items: stretch; padding: 4px 16px 16px; }
          .nav-links button { width: 100%; }
          .nav-burger-row { display: flex; }
        }
      `}</style>

      <div
        className="nav-burger-row"
        style={{ alignItems: "center", justifyContent: "space-between", padding: "12px 18px" }}
      >
        <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, color: "#fff", fontSize: "18px" }}>
          ANOMALIES
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          style={{
            width: "40px",
            height: "36px",
            borderRadius: "8px",
            border: "none",
            background: "#D9D9D9",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span style={{ width: "18px", height: "2px", background: "#111", transition: "transform .2s", transform: open ? "translateY(7px) rotate(45deg)" : "none" }} />
          <span style={{ width: "18px", height: "2px", background: "#111", transition: "opacity .2s", opacity: open ? 0 : 1 }} />
          <span style={{ width: "18px", height: "2px", background: "#111", transition: "transform .2s", transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

      <div className="nav-links">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => handleNav(it.id)}
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              padding: "10px 18px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              background: page === it.id ? "#F4B400" : "#D9D9D9",
              color: "#111",
              boxShadow: "0 3px 0 #000",
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   LANDING PAGE
   ============================================================ */
function LandingPage({ goTo, LANDING_BG }) {
  const btnBase = {
    position: "absolute",
    width: "17.4%",
    height: "8.3%",
    top: "55.2%",
  };
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundImage: `url(${LANDING_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: "4.5%", top: "51%", width: "22%", height: "11%" }}>
  <PillButton style={{ width: "100%", height: "100%", fontSize: "clamp(18px, 2.2vw, 26px)" }} onClick={() => goTo("apply")}>
    APPLY
  </PillButton>
</div>
<div style={{ position: "absolute", left: "38.5%", top: "51%", width: "22%", height: "11%" }}>
  <PillButton style={{ width: "100%", height: "100%", fontSize: "clamp(18px, 2.2vw, 26px)" }} onClick={() => goTo("gallery")}>
    GALLERY
  </PillButton>
</div>
<div style={{ position: "absolute", left: "73%", top: "51%", width: "22%", height: "11%" }}>
  <PillButton style={{ width: "100%", height: "100%", fontSize: "clamp(18px, 2.2vw, 26px)" }} onClick={() => goTo("checker")}>
    CHECKER
  </PillButton>
</div>
    </div>
  );
}

/* ============================================================
   APPLY PAGE
   ============================================================ */
function ApplyRow({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        background: "#000",
        borderRadius: "22px",
        padding: "18px 26px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          color: "#fff",
          fontWeight: 600,
          fontSize: "clamp(14px, 1.6vw, 19px)",
        }}
      >
        {label}
      </span>
      {/* Fixed-width slot so every button/input on the right lines up
          and matches size, exactly like the Figma. */}
      <div style={{ width: "230px", maxWidth: "100%", flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 700,
  fontSize: "15px",
  border: "2px solid #4BBCBC",
  borderRadius: "12px",
  padding: "12px 16px",
  background: "#D9D9D9",
  color: "#111",
  outline: "none",
  width: "100%",
};

function ApplyPage() {
  const [form, setForm] = useState({
    followed: false,
    username: "",
    tagLink: "",
    likedRT: false,
    qtLink: "",
    wallet: "",
  });
  const [status, setStatus] = useState(null); // {type:'success'|'error', msg}
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setStatus(null);
    if (!form.username.trim()) {
      setStatus({ type: "error", msg: "Add your X username first." });
      return;
    }
    if (!isValidEth(form.wallet)) {
      setStatus({ type: "error", msg: "That doesn't look like a valid ETH wallet (0x + 40 hex chars)." });
      return;
    }
    setSubmitting(true);
    const list = await getApplications();
    const existingIdx = list.findIndex(
      (a) => a.wallet.toLowerCase() === form.wallet.toLowerCase()
    );
    const entry = {
      username: form.username.trim().replace(/^@/, ""),
      tagLink: form.tagLink.trim(),
      qtLink: form.qtLink.trim(),
      wallet: form.wallet.trim(),
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    if (existingIdx >= 0) list[existingIdx] = entry;
    else list.push(entry);
    const ok = await saveApplications(list);
    setSubmitting(false);
    if (ok) {
      setStatus({ type: "success", msg: "Application received! Head to Checker any time to see your status." });
    } else {
      setStatus({ type: "error", msg: "Couldn't save right now — please try again." });
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#4BBCBC",
        padding: "40px 16px 70px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "760px" }}>
        <h1
          style={{
            textAlign: "center",
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 44px)",
            color: "#111",
            textDecoration: "underline",
            textUnderlineOffset: "8px",
            marginBottom: "34px",
          }}
        >
          APPLY WHITELIST
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <ApplyRow label="Follow X">
            <PillButton
              style={{ width: "100%" }}
              onClick={() => window.open("https://x.com/anomaliesoneth", "_blank")}
            >
              Follow
            </PillButton>
          </ApplyRow>

          <ApplyRow label="Username">
            <input
              style={inputStyle}
              placeholder="@username"
              value={form.username}
              onChange={set("username")}
            />
          </ApplyRow>

          <ApplyRow label="Tag 3 friends in pinned post">
            <input
              style={inputStyle}
              placeholder="comment link"
              value={form.tagLink}
              onChange={set("tagLink")}
            />
          </ApplyRow>

          <ApplyRow label="Like & RT pinned post">
            <PillButton
              style={{ width: "100%" }}
              onClick={() => window.open("https://x.com/anomaliesoneth", "_blank")}
            >
              Go
            </PillButton>
          </ApplyRow>

          <ApplyRow label={'QT with "I\'m locked in with Anomalies"'}>
            <input
              style={inputStyle}
              placeholder="Quote tweet link"
              value={form.qtLink}
              onChange={set("qtLink")}
            />
          </ApplyRow>

          <ApplyRow label="Submit ETH Wallet">
            <input
              style={{ ...inputStyle, fontFamily: "monospace" }}
              placeholder="0x....."
              value={form.wallet}
              onChange={set("wallet")}
            />
          </ApplyRow>
        </div>

        {status && (
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              color: status.type === "success" ? "#0b3d0b" : "#5c0b0b",
              background: status.type === "success" ? "#c8f5c8" : "#f5c8c8",
              borderRadius: "12px",
              padding: "12px 16px",
            }}
          >
            {status.msg}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
          <PillButton
            tone="white"
            disabled={submitting}
            onClick={handleSubmit}
            style={{ fontSize: "clamp(20px, 3vw, 28px)", padding: "18px 60px" }}
          >
            {submitting ? "Submitting..." : "SUBMIT"}
          </PillButton>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CHECKER PAGE
   ============================================================ */
function CheckerPage() {
  const [addr, setAddr] = useState("");
  const [result, setResult] = useState(null); // null | {found, entry, error}
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setResult(null);
    if (!isValidEth(addr)) {
      setResult({ error: "Enter a valid EVM address (0x + 40 hex characters)." });
      return;
    }
    setChecking(true);
    const list = await getApplications();
    const entry = list.find((a) => a.wallet.toLowerCase() === addr.trim().toLowerCase());
    setChecking(false);
    if (entry) {
      setResult({ found: true, entry });
    } else {
      setResult({ found: false });
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#2D9CE0",
        padding: "60px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(28px, 5vw, 44px)",
          textDecoration: "underline",
          textUnderlineOffset: "8px",
          marginBottom: "34px",
          color: "#111",
        }}
      >
        CHECKER
      </h1>

      <div
        style={{
          background: "#D9D9D9",
          borderRadius: "26px",
          boxShadow: "0 8px 0 #000, 0 8px 20px rgba(0,0,0,0.35)",
          padding: "34px",
          width: "100%",
          maxWidth: "620px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <PillButton
          onClick={handleCheck}
          disabled={checking}
          style={{ flex: "0 0 auto", padding: "16px 34px" }}
        >
          {checking ? "..." : "Check"}
        </PillButton>
        <input
          style={{
            ...inputStyle,
            flex: "1 1 240px",
            border: "none",
            background: "#EDEDED",
            fontFamily: "monospace",
          }}
          placeholder="Paste evm"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
        />
      </div>

      {result && (
        <div
          style={{
            marginTop: "26px",
            width: "100%",
            maxWidth: "620px",
            background: result.error
              ? "#f5c8c8"
              : result.found
              ? "#c8f5c8"
              : "#f5e6a8",
            borderRadius: "18px",
            padding: "22px 26px",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 700,
            color: "#111",
          }}
        >
          {result.error && <div>{result.error}</div>}
          {result.found && (
            <div>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>
                ✅ Whitelisted — status: {result.entry.status}
              </div>
              <div>Username: @{result.entry.username}</div>
              <div style={{ fontSize: "13px", opacity: 0.75, marginTop: "6px" }}>
                Applied {new Date(result.entry.submittedAt).toLocaleString()}
              </div>
            </div>
          )}
          {result.found === false && (
            <div>
              No application found for that wallet yet. Head to Apply to submit one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   GALLERY PAGE
   ============================================================ */
/* ============================================================
   GALLERY PAGE
   ============================================================ */
function GalleryPage({ AVATARS }) {
  const [extra, setExtra] = useState([]);

  useEffect(() => {
    (async () => {
      const ex = await getExtraGallery();
      setExtra(ex);
    })();
  }, []);

  const total = AVATARS.length + extra.length;

  return (
    <div style={{ minHeight: "100%", background: "#086767", padding: "50px 16px 80px" }}>
      <h1
        style={{
          textAlign: "center",
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(28px, 5vw, 44px)",
          textDecoration: "underline",
          textUnderlineOffset: "8px",
          marginBottom: "10px",
          color: "#111",
        }}
      >
        GALLERY
      </h1>
      

      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            background: "#D9D9D9",
            borderRadius: "26px",
            padding: "26px",
            boxShadow: "0 8px 0 #000, 0 10px 24px rgba(0,0,0,0.35)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "18px",
          }}
        >
          {AVATARS.slice(0, 4).map((src, i) => (
            <div
              key={`section1-${i}`}
              style={{
                width: "clamp(120px, 20%, 216px)",
                aspectRatio: "216 / 220",
                borderRadius: "22px",
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src={src}
                alt={`Anomaly #${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#D9D9D9",
            borderRadius: "26px",
            padding: "26px",
            boxShadow: "0 8px 0 #000, 0 10px 24px rgba(0,0,0,0.35)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "18px",
          }}
        >
          {AVATARS.slice(4).map((src, i) => (
            <div
              key={`section2-${i}`}
              style={{
                width: "clamp(120px, 15%, 216px)",
                aspectRatio: "216 / 220",
                borderRadius: "22px",
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src={src}
                alt={`Anomaly #${4 + i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
          {/* New collection items land here as the set grows */}
          {extra.map((item, i) => (
            <div
              key={`extra-${i}`}
              style={{
                width: "clamp(120px, 15%, 216px)",
                aspectRatio: "216 / 220",
                borderRadius: "22px",
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src={item.url}
                alt={`Anomaly #${AVATARS.length + i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function AnomaliesApp() {
  const [page, setPage] = useState("landing");
  const isLanding = page === "landing";

  const goTo = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Nunito', sans-serif",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        // Only the landing page is locked to one viewport with no scroll —
        // every other page scrolls normally.
        height: isLanding ? "100vh" : "auto",
        minHeight: "100vh",
        overflow: isLanding ? "hidden" : "visible",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #666; opacity: 1; }
      `}</style>

      <NavBar page={page} goTo={goTo} />

      {isLanding ? (
        <div style={{ flex: "1 1 auto", minHeight: 0 }}>
          <LandingPage goTo={goTo} LANDING_BG={LANDING_BG} />
        </div>
      ) : (
        <>
          {page === "apply" && <ApplyPage />}
          {page === "checker" && <CheckerPage />}
          {page === "gallery" && <GalleryPage AVATARS={AVATARS} />}
        </>
      )}
    </div>
  );
}
