import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getAllServiceTypes } from "../api/ServiceType";

// ── Floating orb (reuse brand pattern) ───────────────────────────────────────
function FloatingOrb({ style, delay = 0 }) {
  return (
    <motion.div
      style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }}
      animate={{ y: [-12, 12, -12], x: [-6, 6, -6], scale: [1, 1.08, 1] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Sparkle({ style, delay = 0 }) {
  return (
    <motion.div
      style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.75)", pointerEvents: "none", ...style }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay, repeatDelay: 1.5 }}
    />
  );
}

const ChooseBusinessType = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const suggested = location.state?.suggested;
  const isDashBoard = location.state?.navigate || false;

  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    getAllServiceTypes()
      .then((data) => { setBusinessTypes(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Failed to load business types"); setLoading(false); });
  }, []);

  const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z]/gi, "");

  const isSuggested = (typeName) => {
    if (!suggested) return false;
    let base = suggested.split(/\s*[,/()]|\s+or\s+/i).map(s => s.trim()).filter(Boolean);
    base.push(suggested);
    base = base.flatMap(s => [
      s, s.replace(/company|firm/gi, "").trim(),
      s.replace(/limited/gi, "ltd").trim(), s.replace(/ltd/gi, "limited").trim(),
      s.replace(/opc/gi, "one person company").trim(), s.replace(/one person company/gi, "opc").trim(),
    ]);
    const allSuggested = Array.from(new Set(base.filter(Boolean)));
    const normType = normalize(typeName);
    return allSuggested.some(s => {
      const normS = normalize(s);
      if (normType === normS) return true;
      if (normType.length <= 6 || normS.length <= 6) return normType.includes(normS) || normS.includes(normType);
      return false;
    });
  };

  const handleTypeClick = (type) => {
    const typeName = type.Service_Name || "";
    if (isDashBoard) navigate("/startbusiness/subscriptions", { state: { type: type.Id } });
    else navigate("/startbusiness/about", { state: { selectedType: typeName, type: type.Id } });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .cbt-root { font-family: 'DM Sans', sans-serif; }
        .cbt-display { font-family: 'Syne', sans-serif; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }

        /* Left panel shimmer */
        .cbt-left-shimmer::after {
          content: '';
          position: absolute; top: 0; left: -120%; height: 100%; width: 55%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.12), transparent);
          animation: cbt-shimmer 3.5s ease-in-out infinite 1s;
          pointer-events: none; z-index: 3;
        }
        @keyframes cbt-shimmer {
          0%   { left: -120%; }
          55%  { left: 130%; }
          100% { left: 130%; }
        }

        @keyframes cbt-spin { to { transform: rotate(360deg); } }
        .cbt-ring  { animation: cbt-spin 22s linear infinite; }
        .cbt-ring2 { animation: cbt-spin 30s linear infinite reverse; }

        @keyframes cbt-pulse {
          0%   { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .cbt-pulse { position:absolute; inset:-8px; border-radius:50%; border:2px solid rgba(255,255,255,0.45); animation:cbt-pulse 2.2s ease-out infinite; pointer-events:none; }
        .cbt-pulse2 { animation-delay: 0.8s; }

        /* Type cards */
        .type-card {
          position: relative; border-radius: 16px; padding: 16px 18px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          cursor: pointer; border: 1.5px solid rgba(0,0,0,0.08);
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
        }
        .type-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #F5C518, #e8a800);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .type-card:hover {
          border-color: rgba(245,197,24,0.45);
          box-shadow: 0 10px 32px rgba(245,197,24,0.18);
          transform: translateY(-2px);
        }
        .type-card:hover::before { transform: scaleX(1); }

        .type-card--suggested {
          background: #F5C518 !important;
          border-color: #e8a800 !important;
          box-shadow: 0 8px 28px rgba(245,197,24,0.35) !important;
          transform: scale(1.02);
        }
        .type-card--suggested::before { transform: scaleX(1) !important; background: rgba(0,0,0,0.1) !important; }

        .type-badge {
          font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
          background: rgba(26,26,26,0.12); color: #1a1a1a;
          border-radius: 100px; padding: 3px 9px; white-space: nowrap;
        }

        .type-arrow {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: #9ca3af; transition: all 0.3s;
        }
        .type-card:hover .type-arrow,
        .type-card--suggested .type-arrow {
          background: #1a1a1a; color: #F5C518; transform: translateX(2px);
        }

        /* Help strip */
        .help-strip {
          background: #1a1a1a; border-radius: 18px; padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.14);
        }
        .quiz-btn {
          background: #F5C518; color: #1a1a1a;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px;
          border-radius: 100px; padding: 10px 22px; border: none; cursor: pointer;
          transition: all 0.25s; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(245,197,24,0.4);
        }
        .quiz-btn:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.14); }

        /* Back button */
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.25); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.35); border-radius: 100px;
          padding: 8px 18px; font-size: 13px; font-weight: 600;
          color: #1a1a1a; cursor: pointer; transition: all 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .back-btn:hover { background: rgba(255,255,255,0.45); transform: translateX(-2px); }

        /* Skeleton */
        .skel { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skel-shine 1.4s ease infinite; border-radius: 16px; height: 58px; }
        @keyframes skel-shine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* Stat pill (right panel) */
        .rstat {
          background: rgba(255,255,255,0.22); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.35); border-radius: 12px;
          padding: 10px 14px; flex: 1; text-align: center;
        }
        .rstat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #1a1a1a; letter-spacing: -0.02em; }
        .rstat-lbl { font-size: 10px; color: rgba(26,26,26,0.55); margin-top: 2px; }
      `}</style>

      <motion.div
        className="cbt-root w-full max-w-5xl"
        initial={{ opacity: 0, x: 80, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -80, scale: 0.97 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: 28, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(245,197,24,0.22), 0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex flex-col lg:flex-row" style={{ minHeight: 620 }}>

          {/* ════ LEFT — WHITE CONTENT ════ */}
          <div
            className="lg:w-[56%]"
            style={{
              position: "relative",
              backgroundImage: "url('/Images/hero-bg.webp')",
              backgroundSize: "cover", backgroundPosition: "center",
              display: "flex", flexDirection: "column", justifyContent: "center",
              gap: 20, padding: "36px 40px",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.91)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Logo */}
              <motion.img
                src="/Images/logo.webp" alt="Bizpole"
                style={{ height: 36, width: "auto", alignSelf: "flex-start" }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              />

              {/* Heading */}
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(26,26,26,0.4)", border: "1px solid rgba(26,26,26,0.1)",
                  borderRadius: 100, padding: "4px 12px", marginBottom: 10,
                }}>
                  <motion.span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5C518", display: "inline-block" }}
                    animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                  Step 2 of 3
                </span>

                <h1 className="cbt-display" style={{ color: "#1a1a1a", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", marginBottom: 6 }}>
                  Choose your{" "}
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <span style={{ position: "relative", zIndex: 1 }}>business type</span>
                    <motion.span
                      style={{ position: "absolute", inset: "-4px -3px", background: "#F5C518", borderRadius: 10, zIndex: 0, originX: 0 }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ delay: 0.75, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                </h1>
                <p style={{ color: "#9ca3af", fontSize: 14, fontWeight: 300, lineHeight: 1.65 }}>
                  Select the business structure that best suits your needs and goals.
                </p>
              </motion.div>

              {/* Business type grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {loading && Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} className="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }} />
                ))}
                {error && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#ef4444", fontSize: 14 }}>{error}</div>
                )}
                {!loading && !error && businessTypes.map((type, idx) => {
                  const typeName = type.Service_Name || "";
                  const suggested = isSuggested(typeName);
                  return (
                    <motion.div
                      key={type.Id || typeName}
                      className={`type-card ${suggested ? "type-card--suggested" : ""}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * idx, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ scale: suggested ? 1.03 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onHoverStart={() => setHoveredId(type.Id)}
                      onHoverEnd={() => setHoveredId(null)}
                      onClick={() => handleTypeClick(type)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 7, marginBottom: 2,
                          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#1a1a1a",
                        }}>
                          {typeName}
                          {suggested && (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, background: "#fff", borderRadius: "50%", flexShrink: 0 }}>
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          )}
                        </div>
                        {suggested && <span className="type-badge">Recommended</span>}
                      </div>
                      <div className="type-arrow">→</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Help strip */}
              <motion.div
                className="help-strip"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              >
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>Confused about which type?</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>We're here to help — your answer is just a quiz away.</div>
                </div>
                <motion.button className="quiz-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/quiz")}>
                  Take Quiz →
                </motion.button>
              </motion.div>

            </div>
          </div>

          {/* ════ RIGHT — YELLOW PANEL ════ */}
          <div
            className="cbt-left-shimmer lg:w-[44%]"
            style={{
              background: "linear-gradient(145deg, #F5C518 0%, #f0b800 45%, #e6a500 100%)",
              position: "relative", overflow: "hidden",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              padding: "36px",
            }}
          >
            {/* Orbs */}
            <FloatingOrb delay={0}   style={{ width: 200, height: 200, top: "-50px",  right: "-50px",  background: "rgba(255,255,255,0.18)", filter: "blur(40px)" }} />
            <FloatingOrb delay={1.8} style={{ width: 130, height: 130, bottom: "50px", left: "-25px",  background: "rgba(255,255,255,0.13)", filter: "blur(24px)" }} />
            <FloatingOrb delay={0.9} style={{ width: 70,  height: 70,  bottom: "32%", right: "12%",   background: "rgba(255,255,255,0.2)",  filter: "blur(12px)" }} />

            {/* Sparkles */}
            <Sparkle delay={0}   style={{ top: "18%",  left: "12%" }} />
            <Sparkle delay={0.9} style={{ top: "62%",  right: "16%" }} />
            <Sparkle delay={1.7} style={{ bottom: "22%", left: "42%" }} />
            <Sparkle delay={2.4} style={{ top: "38%",  right: "28%" }} />

            {/* Rings */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 1 }}>
              <svg className="cbt-ring" width="360" height="360" viewBox="0 0 360 360" fill="none" style={{ opacity: 0.12 }}>
                <circle cx="180" cy="180" r="168" stroke="white" strokeWidth="1" strokeDasharray="6 14" />
              </svg>
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 1 }}>
              <svg className="cbt-ring2" width="260" height="260" viewBox="0 0 260 260" fill="none" style={{ opacity: 0.1 }}>
                <circle cx="130" cy="130" r="118" stroke="white" strokeWidth="1" strokeDasharray="3 18" />
              </svg>
            </div>

            {/* Back button */}
            <motion.div style={{ position: "relative", zIndex: 4, alignSelf: "flex-start" }}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
              <button
                className="back-btn"
                onClick={isDashBoard ? () => navigate(-1) : onBack}
              >
                <ArrowLeft size={15} />
                Back
              </button>
            </motion.div>

            {/* Center content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative", zIndex: 4, display: "flex", flexDirection: "column", gap: 20 }}
            >
              {/* Icon with pulse */}
              <div style={{ position: "relative", width: 78, height: 78 }}>
                <div className="cbt-pulse" />
                <div className="cbt-pulse cbt-pulse2" />
                {/* <motion.div
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 78, height: 78, borderRadius: 22,
                    background: "rgba(255,255,255,0.3)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", zIndex: 1,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                  }}
                >
                  <Building2 size={32} color="#1a1a1a" />
                </motion.div> */}
              </div>

              <div>
                <h2 className="cbt-display" style={{ color: "#1a1a1a", fontSize: "clamp(1.65rem, 2.4vw, 2.1rem)", marginBottom: 10 }}>
                  Build Your<br />Dream Business.
                </h2>
                <p style={{ color: "rgba(26,26,26,0.58)", fontSize: 13.5, lineHeight: 1.7, fontWeight: 300, maxWidth: 250 }}>
                  Every great company starts with choosing the right legal foundation.
                </p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              style={{ display: "flex", gap: 10, position: "relative", zIndex: 4 }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            >
              {[{ num: "10+", lbl: "Structures" }, { num: "50K+", lbl: "Registered" }, { num: "13+", lbl: "Yrs Exp." }].map(s => (
                <div key={s.lbl} className="rstat">
                  <div className="rstat-num">{s.num}</div>
                  <div className="rstat-lbl">{s.lbl}</div>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ChooseBusinessType;