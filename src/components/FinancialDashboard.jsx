import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion";

// ─── Mock Dashboard Data ──────────────────────────────────────────────────────
const transactions = [
  { date: "Aug 24", merchant: "Spotify", category: "Digital Goods", amount: "$9.99" },
  { date: "Aug 24", merchant: "Spotify", category: "Digital Goods", amount: "$9.99" },

];

const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const inViewRef = useRef(null);
  const inView = useInView(inViewRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseFloat(value);
    const duration = 1800;
    const step = 16;
    const increment = end / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, step);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={inViewRef}>
      {prefix}{typeof display === "number" && display % 1 !== 0
        ? display.toFixed(2)
        : Math.floor(display).toLocaleString()}{suffix}
    </span>
  );
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline() {
  const points = "10,55 35,40 55,48 75,28 100,35 125,20 150,30 175,15 200,25 225,10 250,22";
  return (
    <svg viewBox="0 0 260 70" fill="none" className="w-full h-16">
      <defs>
        <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5C518" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F5C518" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        points={points}
        stroke="#F5C518"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
      />
      <polygon
        points={`10,70 ${points} 250,70`}
        fill="url(#spGrad)"
      />
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart() {
  const r = 36, cx = 44, cy = 44, circumference = 2 * Math.PI * r;
  const segments = [
    { pct: 0.45, color: "#F5C518" },
    { pct: 0.30, color: "#3B82F6" },
    { pct: 0.25, color: "#10B981" },
  ];
  let offset = 0;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      {segments.map((s, i) => {
        const dash = s.pct * circumference;
        const gap = circumference - dash;
        const rot = offset * 360;
        offset += s.pct;
        return (
          <motion.circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="10"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rot - 90} ${cx} ${cy})`}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 1.2, delay: 0.4 + i * 0.15, ease: "easeOut" }}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={26} fill="#1a1a1a" />
    </svg>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────
function DashboardPreview() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="relative w-full rounded-2xl overflow-hidden bg-[#111111] border border-white/10 shadow-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F5C518]" />
          <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Wallet</span>
        </div>
        <div className="flex gap-1.5">
          {["#ff5f57","#febc2e","#28c840"].map(c => (
            <div key={c} style={{ background: c }} className="w-2.5 h-2.5 rounded-full opacity-70" />
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-28 bg-[#0d0d0d] border-r border-white/5 px-3 py-4 flex flex-col gap-1">
          {["Dashboard","My goals","Transactions","Budget"].map((item, i) => (
            <div key={item}
              className={`text-[10px] px-2 py-1.5 rounded-md cursor-pointer transition-all
                ${i === 0 ? "bg-[#F5C518]/15 text-[#F5C518] font-semibold" : "text-white/30 hover:text-white/60"}`}>
              {item}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-4 space-y-3">
          <div>
            <div className="text-white text-sm font-bold">Hello Johnny 👋</div>
            <div className="text-white/30 text-[10px]">Here is your team overview</div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "My balance", value: "121,00€", color: "text-white" },
              { label: "Income", value: "+1,060€", color: "text-[#10B981]" },
              { label: "Expenses", value: "-862€", color: "text-red-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-2.5">
                <div className="text-white/30 text-[9px] mb-1">{s.label}</div>
                <div className={`text-xs font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-white/40 text-[9px] mb-2">Monthly split</div>
              <div className="flex items-center gap-2">
                <DonutChart />
                <div className="space-y-1">
                  {[["#F5C518","Housing"],["#3B82F6","Food"],["#10B981","Fun"]].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1">
                      <div style={{ background: c }} className="w-1.5 h-1.5 rounded-full" />
                      <span className="text-[9px] text-white/40">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-white/40 text-[9px] mb-1">Spending frequency</div>
              <Sparkline />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Transaction Panel ────────────────────────────────────────────────────────
function TransactionPanel() {
  return (
    <motion.div
      className="absolute -right-8 top-4 w-45 bg-[#1a1a1a]/95 backdrop-blur-xl border z-10 border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <span className="text-white text-xs font-semibold">Processed</span>
        <span className="text-[#F5C518] text-xs font-bold">17 of 17</span>
      </div>
      <div className="divide-y divide-white/5">
        {transactions.map((t, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between px-4 py-2.5"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
          >
            <div>
              <div className="text-white/80 text-[11px] font-medium">{t.merchant}</div>
              <div className="text-white/30 text-[9px]">{t.category}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/30">{t.date}</div>
              <div className="text-xs font-bold text-white">{t.amount}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Hero Section ────────────────────────────────────────────────────────
export default function FinancialHero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yText = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const screenY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const screenRotate = useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, -2]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  const springY = useSpring(y, { stiffness: 80, damping: 20 });

  const textRef = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "-60px" });

  const badgeRef = useRef(null);
  const badgeInView = useInView(badgeRef, { once: true, margin: "-40px" });

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const fadeUp = {
    hidden: { y: 32, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hero-section {
          font-family: 'DM Sans', sans-serif;
          background: #f7f5f0;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .grain {
          position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .blob {
          position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
        }

        .hero-display {
          font-family: 'Syne', sans-serif;
          font-weight: 400;
          line-height: 1.0;
          letter-spacing: -0.03em;
        }

        .yellow-pill {
          background: #F5C518;
          border-radius: 100px;
        }

        .avatar-stack img {
          width: 30px; height: 30px; border-radius: 50%;
          border: 2px solid #f7f5f0;
          margin-left: -10px;
          object-fit: cover;
        }
        .avatar-stack img:first-child { margin-left: 0; }

        .screen-wrap {
          perspective: 1200px;
        }
      `}</style>

      <section ref={sectionRef} className="hero-section">
        <div className="grain" />

        {/* Background blobs */}
        <div className="blob w-[500px] h-[500px] bg-[#F5C518] opacity-[0.12] top-[-100px] left-[-100px]" />
        <div className="blob w-[400px] h-[400px] bg-[#3B82F6] opacity-[0.06] bottom-0 right-[-80px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── Left: Text ── */}
            <motion.div
              ref={textRef}
              style={{ y: yText }}
              variants={stagger}
              initial="hidden"
              animate={textInView ? "show" : "hidden"}
              className="space-y-7"
            >
              {/* Label */}
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#1a1a1a]/50 border border-[#1a1a1a]/10 rounded-full px-4 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] inline-block animate-pulse" />
                  Financial Platform
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeUp} className="hero-display text-[#1a1a1a] text-5xl md:text-6xl leading-[1.1]">
                <span className="block">Easy</span>
                <span className="block">
                  collab
                  <span className="relative inline-block mx-1">
                    <span className="relative z-10">o</span>
                    <motion.span
                      className="yellow-pill absolute inset-[-4px_-2px] z-0"
                      initial={{ scaleX: 0 }}
                      animate={textInView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      style={{ originX: 0 }}
                    />
                  </span>
                  rative
                </span>
                <span className="block text-[#1a1a1a]/20">financial</span>
                <span className="block">team.</span>
              </motion.h1>

              {/* Body */}
              <motion.p variants={fadeUp}
                className="text-[#1a1a1a]/55 text-base md:text-lg leading-relaxed max-w-md font-light">
                No need to worry about your files being lost — we are built to be your most reliable financial storage platform, ever.
              </motion.p>

              {/* CTA */}
              <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="yellow-pill px-7 py-3.5 text-[#1a1a1a] font-semibold text-sm shadow-lg shadow-[#F5C518]/30 hover:shadow-[#F5C518]/50 transition-shadow"
                >
                  Get started free →
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="text-sm font-medium text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors flex items-center gap-1.5"
                >
                  Watch demo
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#1a1a1a]/15 text-xs">▶</span>
                </motion.button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                ref={badgeRef}
                variants={fadeUp}
                className="flex items-center gap-3 pt-2"
              >
                <div className="avatar-stack flex">
                  {[1,2,3].map(i => (
                    <motion.div
                      key={i}
                      initial={{ x: -10, opacity: 0 }}
                      animate={badgeInView ? { x: 0, opacity: 1 } : {}}
                      transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5C518] to-[#e6a800] border-2 border-[#f7f5f0] -ml-2 first:ml-0 overflow-hidden"
                      style={{ marginLeft: i === 1 ? 0 : -10 }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#1a1a1a]">
                        {["JK","AM","TR"][i-1]}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1a1a1a]">
                    <AnimatedNumber value={10000} prefix="+" suffix=" people" />
                  </div>
                  <div className="text-xs text-[#1a1a1a]/40">have already tried</div>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Right: Screen ── */}
            <motion.div
              style={{ y: springY, opacity }}
              className="screen-wrap relative"
            >
              <motion.div
                style={{ rotateY: screenRotate }}
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-[#F5C518]/20 blur-[60px] rounded-3xl scale-90 translate-y-6 z-0" />

                {/* Monitor frame */}
                <div className="relative z-10 bg-[#1a1a1a] rounded-3xl p-2 shadow-2xl border border-white/10">
                  <div className="bg-[#F5C518] rounded-2xl p-4">
                    <DashboardPreview />
                  </div>
                  {/* Monitor stand */}
                  <div className="flex justify-center mt-2">
                    <div className="w-12 h-2 bg-white/10 rounded-full" />
                  </div>
                </div>

                {/* Floating transaction panel */}
                <TransactionPanel />

                {/* Floating badge - processed */}
                <motion.div
                  className="absolute -left-5 bottom-16 bg-white rounded-2xl px-4 py-3 shadow-xl border border-black/5 z-50"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F5C518] flex items-center justify-center text-sm">💰</div>
                    <div>
                      <div className="text-xs font-bold text-[#1a1a1a]">+$1,240.00</div>
                      <div className="text-[10px] text-[#1a1a1a]/40">Income this week</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating security badge */}
                <motion.div
                  className="absolute right-2 -bottom-4 bg-[#1a1a1a] text-white rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2 z-50 border border-white/10   "
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3, scale: 1.02 }}
                >
                  <span className="text-[#F5C518] text-sm">🔒</span>
                  <div>
                    <div className="text-[10px] font-semibold">Bank-grade security</div>
                    <div className="text-[9px] text-white/40">256-bit encryption</div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

          </div>

          {/* ── Bottom Stats Bar ── */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#1a1a1a]/8 pt-10"
          >
            {[
              { label: "Active users", value: 10000, prefix: "+", suffix: "" },
              { label: "Transactions daily", value: 52000, prefix: "", suffix: "+" },
              { label: "Countries supported", value: 48, prefix: "", suffix: "" },
              { label: "Uptime guarantee", value: 99.9, prefix: "", suffix: "%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                className="space-y-1"
              >
                <div className="text-2xl md:text-3xl font-bold text-[#1a1a1a] hero-display">
                  <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-[#1a1a1a]/40 uppercase tracking-wider font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}