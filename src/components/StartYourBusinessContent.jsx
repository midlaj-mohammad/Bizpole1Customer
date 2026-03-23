import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SigninModal from "./Modals/SigninModal";

// ── Floating orb ──────────────────────────────────────────────────────────────
function FloatingOrb({ style, delay = 0 }) {
  return (
    <motion.div
      style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }}
      animate={{ y: [-12, 12, -12], x: [-6, 6, -6], scale: [1, 1.08, 1] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Sparkle ───────────────────────────────────────────────────────────────────
function Sparkle({ style, delay = 0 }) {
  return (
    <motion.div
      style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.75)", pointerEvents: "none", ...style }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay, repeatDelay: 1.5 }}
    />
  );
}

const StartYourBusinessContent = ({ onNext }) => {
  const navigate = useNavigate();
  const [showSigninModal, setShowSigninModal] = useState(false);

  const cards = [
    {
      id: "new",
      emoji: "🚀",
      title: "Start a New Company",
      sub: "Perfect for entrepreneurs starting their first business venture",
      badge: "Most Popular",
      onClick: onNext,
    },
    {
      id: "existing",
      emoji: "🏢",
      title: "Onboard Existing Company",
      sub: "Own or belong to a company, this is for you",
      badge: null,
      onClick: () => navigate("/existing-companies"),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .syb-root { font-family: 'DM Sans', sans-serif; }
        .syb-display { font-family: 'Syne', sans-serif; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }

        /* Left panel sweep shimmer */
        .left-panel-shimmer::after {
          content: '';
          position: absolute; top: 0; left: -120%; height: 100%; width: 55%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.12), transparent);
          animation: shimmer-sweep 3.5s ease-in-out infinite 1s;
          pointer-events: none; z-index: 3;
        }
        @keyframes shimmer-sweep {
          0%   { left: -120%; }
          55%  { left: 130%; }
          100% { left: 130%; }
        }

        /* Dashed rotating ring */
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .deco-ring { animation: spin-slow 22s linear infinite; }
        .deco-ring-rev { animation: spin-slow 30s linear infinite reverse; }

        /* Pulse rings on icon */
        @keyframes pulse-out {
          0%   { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .pulse-ring {
          position: absolute; inset: -8px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.45);
          animation: pulse-out 2.2s ease-out infinite;
          pointer-events: none;
        }
        .pulse-ring-2 { animation-delay: 0.8s; }

        /* Right action cards */
        .rc {
          width: 100%; text-align: left; background: transparent;
          border: none; padding: 0; cursor: pointer; border-radius: 18px;
        }
        .rc-inner {
          border-radius: 18px; padding: 20px 22px;
          display: flex; align-items: center; gap: 16px;
          background: #F5C518;
          border: 1.5px solid rgba(0,0,0,0.08);
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          position: relative; overflow: hidden;
        }
        .rc-inner::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #272624, #e8a800);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .rc:hover .rc-inner {
          border-color: rgba(128, 125, 112, 0.45);
          box-shadow: 0 10px 36px rgba(245,197,24,0.18);
          transform: translateY(-3px);
        }
        .rc:hover .rc-inner::after { transform: scaleX(1); }

        .rc-icon {
          width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
          background: #fef9e7; border: 1px solid rgba(245,197,24,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; transition: all 0.3s;
        }
        .rc:hover .rc-icon { transform: rotate(-8deg) scale(1.1); background: #fef3c7; }

        .rc-arrow {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: #f3f4f6; border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #9ca3af; transition: all 0.3s;
        }
        .rc:hover .rc-arrow { background: #F5C518; color: #1a1a1a; transform: translateX(4px); }

        .rc-badge {
          font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
          background: #ebe9e3; color: #1a1a1a; border-radius: 100px; padding: 3px 9px;
        }

        /* Sign-in strip */
        .signin-strip {
          background: #f7f5f0; border-radius: 16px; padding: 18px 22px;
          border: 1.5px solid rgba(0,0,0,0.07);
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .signin-btn {
          background: #F5C518; color: #1a1a1a;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px;
          border-radius: 100px; padding: 10px 24px; border: none; cursor: pointer;
          transition: all 0.25s; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(245,197,24,0.4);
        }
        .signin-btn:hover {
          background: #1a1a1a; color: #F5C518;
          transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.18);
        }

        /* Left stat pill */
        .lstat {
          background: rgba(255,255,255,0.22); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.35); border-radius: 12px;
          padding: 10px 14px; flex: 1;
        }
        .lstat-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #1a1a1a; letter-spacing: -0.02em; }
        .lstat-lbl { font-size: 10px; color: rgba(26,26,26,0.55); margin-top: 2px; }
      `}</style>

      <SigninModal isOpen={showSigninModal} onClose={() => setShowSigninModal(false)} />

      <motion.div
        className="syb-root w-full max-w-5xl"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.97 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: 28, overflow: "hidden",
          boxShadow: "0 32px 80px rgba(245,197,24,0.22), 0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex flex-col lg:flex-row " style={{ minHeight: 620 }}>

          {/* ════ LEFT — YELLOW ════ */}
          <div
            className="left-panel-shimmer lg:w-[44%]"
            style={{
              background: "linear-gradient(145deg, #F5C518 0%, #f0b800 45%, #e6a500 100%)",
              position: "relative", overflow: "hidden",
              display: "flex", flexDirection: "column",
              justifyContent: "space-between",
              padding: "36px",
            }}
          >
            {/* Soft orbs */}
            <FloatingOrb delay={0}   style={{ width: 200, height: 200, top: "-50px",  right: "-50px",  background: "rgba(255,255,255,0.18)", filter: "blur(40px)" }} />
            <FloatingOrb delay={1.8} style={{ width: 130, height: 130, bottom: "50px", left: "-25px",  background: "rgba(255,255,255,0.13)", filter: "blur(24px)" }} />
            <FloatingOrb delay={0.9} style={{ width: 70,  height: 70,  bottom: "32%", right: "12%",   background: "rgba(255,255,255,0.2)",  filter: "blur(12px)" }} />

            {/* Sparkles */}
            <Sparkle delay={0}   style={{ top: "18%",  left: "12%" }} />
            <Sparkle delay={0.9} style={{ top: "62%",  right: "16%" }} />
            <Sparkle delay={1.7} style={{ bottom: "22%", left: "42%" }} />
            <Sparkle delay={2.4} style={{ top: "38%",  right: "28%" }} />

            {/* Rotating dashed rings — centered */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 1 }}>
              <svg className="deco-ring" width="360" height="360" viewBox="0 0 360 360" fill="none" style={{ opacity: 0.12 }}>
                <circle cx="180" cy="180" r="168" stroke="white" strokeWidth="1" strokeDasharray="6 14" />
              </svg>
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 1 }}>
              <svg className="deco-ring-rev" width="260" height="260" viewBox="0 0 260 260" fill="none" style={{ opacity: 0.1 }}>
                <circle cx="130" cy="130" r="118" stroke="white" strokeWidth="1" strokeDasharray="3 18" />
              </svg>
            </div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ position: "relative", zIndex: 4 }}
            >
              <img src="/Images/logo.webp" alt="Bizpole" style={{ height: 38, width: "auto" }} />
            </motion.div>

            {/* Center hero */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative", zIndex: 4, display: "flex", flexDirection: "column", gap: 20 }}
            >
              {/* Icon with pulse */}
              <div style={{ position: "relative", width: 78, height: 78 }}>
                <div className="pulse-ring" />
                <div className="pulse-ring pulse-ring-2" />
              
             
              </div>

              <div>
                <h2 className="syb-display" style={{ color: "#f8f8f8", fontSize: "clamp(1.65rem, 2.4vw, 2.1rem)", marginBottom: 10 }}>
                  Your business<br /> <span className="text-black">journey begins.</span>
                </h2>
                <p style={{ color: "rgb(0, 0, 0)", fontSize: 13.5, lineHeight: 1.7, fontWeight: 300, maxWidth: 250 }}>
                  Join 50,000+ entrepreneurs who've built and scaled their dream businesses with Bizpole.
                </p>
              </div>
            </motion.div>

            {/* Stats row */}
            {/* <motion.div
              style={{ display: "flex", gap: 10, position: "relative", zIndex: 4 }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.55 }}
            >
              {[{ num: "50K+", lbl: "Businesses" }, { num: "13+", lbl: "Years" }, { num: "99%", lbl: "Happy" }].map(s => (
                <div key={s.lbl} className="lstat">
                  <div className="lstat-num">{s.num}</div>
                  <div className="lstat-lbl">{s.lbl}</div>
                </div>
              ))}
            </motion.div> */}
          </div>

          {/* ════ RIGHT — WHITE / BG ════ */}
          <div
            className="lg:w-[56%]"
            style={{
              position: "relative",
              backgroundImage: "url('/Images/hero-bg.webp')",
              backgroundSize: "cover", backgroundPosition: "center",
              display: "flex", flexDirection: "column", justifyContent: "center",
              gap: 22, padding: "36px 40px",
            }}
          >
            {/* Translucent overlay */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.9)", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.6 }}
              >
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(26,26,26,0.4)", border: "1px solid rgba(26,26,26,0.1)",
                  borderRadius: 100, padding: "4px 12px", marginBottom: 12,
                }}>
                  <motion.span
                    style={{ width: 5, height: 5, borderRadius: "50%", background: "#F5C518", display: "inline-block" }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  Bizpole Suite
                </span>

                <h1 className="syb-display" style={{ color: "#1a1a1a", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", marginBottom: 8 }}>
                  Let's talk{" "}
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <span style={{ position: "relative", zIndex: 1 }}>business!</span>
                    <motion.span
                      style={{ position: "absolute", inset: "-4px -3px", background: "#F5C518", borderRadius: 10, zIndex: 0, originX: 0 }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.85, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                </h1>
                <p style={{ color: "#9ca3af", fontSize: 14.5, fontWeight: 300, lineHeight: 1.65 }}>
                  To begin this journey, tell us what type of account you'd be opening.
                </p>
              </motion.div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cards.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: 22 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.13, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.button
                      className="rc"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={card.onClick}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <div className="rc-inner">
                       
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>
                              {card.title}
                            </span>
                            {card.badge && <span className="rc-badge">{card.badge}</span>}
                          </div>
                          <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 300 }}>{card.sub}</span>
                        </div>
                        <div className="rc-arrow">→</div>
                      </div>
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Sign-in */}
              <motion.div
                className="signin-strip"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.74, duration: 0.5 }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a", marginBottom: 2 }}>
                    Already have an account?
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 300 }}>
                    Sign in to continue where you left off
                  </div>
                </div>
                <motion.button
                  className="signin-btn"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowSigninModal(true)}
                >
                  Sign In →
                </motion.button>
              </motion.div>

            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
};

export default StartYourBusinessContent;
