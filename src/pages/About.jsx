import { useRef, useState, useEffect } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationFrame,
} from "framer-motion";
import { useNavigate } from "react-router-dom";

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseFloat(to);
    const dur = 2000, step = 16;
    const inc = end / (dur / step);
    const t = setInterval(() => {
      start += inc;
      if (start >= end) { setVal(end); clearInterval(t); }
      else setVal(start);
    }, step);
    return () => clearInterval(t);
  }, [inView, to]);
  const display = val % 1 === 0 ? Math.floor(val).toLocaleString() : val.toFixed(0);
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

// ── Marquee ───────────────────────────────────────────────────────────────────
function Marquee({ items, speed = 40, reverse = false }) {
  const x = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    const dir = reverse ? 1 : -1;
    x.set(((x.get() + dir * speed * delta / 1000) % 300 + 300) % 300 - 300);
  });
  const doubled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden w-full">
      <motion.div style={{ x }} className="flex gap-6 w-max">
        {doubled.map((item, i) => (
          <div key={i} className="marquee-item">{item}</div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Stagger helpers ───────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};
const fadeLeft = {
  hidden: { x: -50, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};
const fadeRight = {
  hidden: { x: 50, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

function Section({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AboutPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const progressBar = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Parallax for hero image
  const { scrollYProgress: heroSYP } = useScroll({ target: heroRef, offset: ["start end", "end start"] });
  const heroImgY = useTransform(heroSYP, [0, 1], [-60, 60]);
  const heroOpacity = useTransform(heroSYP, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const marqueeItems = [
    "Business Registration", "GST Filing", "Compliance", "Legal Services",
    "Tax Planning", "Trademark", "ISO Certification", "Company Formation",
  ];

  const teamMembers = [
    { name: "Rajesh Kumar", role: "CEO & Founder", emoji: "👨‍💼" },
    { name: "Priya Sharma", role: "Chief Legal Officer", emoji: "👩‍⚖️" },
    { name: "Arun Menon", role: "Head of Finance", emoji: "👨‍💻" },
    { name: "Sneha Nair", role: "Operations Director", emoji: "👩‍🏫" },
  ];

  const values = [
    { icon: "⚡", title: "Speed", desc: "Lightning-fast service delivery without compromising quality." },
    { icon: "🔒", title: "Trust", desc: "Bank-grade security and complete transparency in every transaction." },
    { icon: "🎯", title: "Precision", desc: "Every detail handled with expert-level accuracy and care." },
    { icon: "🤝", title: "Partnership", desc: "We grow only when your business grows. Always on your side." },
    { icon: "🌍", title: "Scale", desc: "From Kerala to the world — we help businesses go global." },
    { icon: "💡", title: "Innovation", desc: "Technology-first approach to transform traditional compliance." },
  ];

  const milestones = [
    { year: "2012", title: "Founded in Kerala", desc: "Started with a mission to simplify business compliance for Indian entrepreneurs." },
    { year: "2015", title: "10,000 Clients", desc: "Crossed the 10,000 mark — proof that businesses trust Bizpole." },
    { year: "2018", title: "Pan-India Expansion", desc: "Opened operations in 15 states, serving businesses across the country." },
    { year: "2021", title: "Digital-First Platform", desc: "Launched our all-in-one digital dashboard for end-to-end business management." },
    { year: "2024", title: "50,000+ Businesses", desc: "Proudly serving over 50,000 businesses and counting." },
  ];

  const awards = [
    { title: "Best Startup of the Year", org: "Kerala Government, 2019" },
    { title: "Top 50 LegalTech Firms", org: "Inc42 Magazine, 2021" },
    { title: "Excellence in Compliance", org: "NASSCOM, 2022" },
    { title: "Best FinTech Enabler", org: "Startup India, 2023" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

        :root {
          --yellow: #F5C518;
          --yellow-dim: rgba(245,197,24,0.15);
          --dark: #0e0e0f;
          --dark2: #141416;
          --light: #f7f5f0;
          --muted: rgba(255,255,255,0.45);
        }

       

        .about-page {
        
          background: var(--light);
          color: var(--dark);
          overflow-x: hidden;
        }

        /* Progress bar */
        .scroll-progress {
          position: fixed; top: 0; left: 0; right: 0; height: 3px;
          background: var(--yellow); transform-origin: left;
          z-index: 100;
        }

        /* Grain overlay */
        .grain {
          position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        /* Display font */
        .display { font-family: 'Syne', sans-serif; font-weight: 500; letter-spacing: -0.03em; line-height: 1.0; }
        .display-md { font-family: 'Syne', sans-serif; font-weight: 500; letter-spacing: -0.025em; line-height: 1.1; }

        /* ── Hero ─────────────────────────────── */
        .hero-section {
          min-height: 92vh;
          background: var(--dark);
          position: relative;
          display: flex; flex-direction: column; justify-content: flex-end;
          overflow: hidden;
          padding-top: 80px;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(14,14,15,0.3) 0%, rgba(14,14,15,0.7) 50%, rgba(14,14,15,1) 100%);
          z-index: 2;
        }
        .hero-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; z-index: 1;
          filter: saturate(0.6);
        }
        .hero-content {
          position: relative; z-index: 3;
          padding: 0 6% 8%;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,197,24,0.15); border: 1px solid rgba(245,197,24,0.3);
          border-radius: 100px; padding: 6px 14px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--yellow); margin-bottom: 24px;
        }
        .hero-h1 { color: #fff; font-size: clamp(2.8rem, 7vw, 6rem); margin-bottom: 24px; }
        .hero-h1 em { font-style: normal; color: var(--yellow); }
        .hero-sub { color: rgba(255,255,255,0.5); font-size: 16px; max-width: 480px; line-height: 1.7; font-weight: 300; }

        /* Hero stats bar */
        .hero-stats {
          position: relative; z-index: 3;
          display: flex; gap: 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 0 6%;
        }
        .hero-stat {
          flex: 1; padding: 28px 0;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .hero-stat:last-child { border-right: none; }
        .hero-stat-num {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(1.8rem, 4vw, 2.8rem);
          color: var(--yellow); letter-spacing: -0.03em; line-height: 1;
        }
        .hero-stat-label { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; font-weight: 400; }

        /* ── Marquee ──────────────────────────── */
        .marquee-section { background: var(--yellow); padding: 14px 0; overflow: hidden; }
        .marquee-item {
          white-space: nowrap; font-size: 13px; font-weight: 700;
          color: #1a1a1a; letter-spacing: 0.05em; text-transform: uppercase;
          padding: 0 28px;
          display: flex; align-items: center; gap: 12px;
        }
        .marquee-item::after { content: '◆'; font-size: 8px; opacity: 0.4; }

        /* ── Numbers section ──────────────────── */
        .numbers-section {
          background: var(--dark);
          padding: 80px 6%;
          position: relative; overflow: hidden;
        }
        .numbers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .number-item {
          padding: 48px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: flex-start; gap: 40px;
        }
        .number-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.07); padding-right: 48px; }
        .number-item:nth-child(even) { padding-left: 48px; }
        .number-label-text { color: rgba(255,255,255,0.4); font-size: 14px; line-height: 1.6; max-width: 260px; font-weight: 300; }
        .big-num {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(3rem, 6vw, 5rem);
          color: #fff; letter-spacing: -0.04em; line-height: 1;
          white-space: nowrap;
        }
        .big-num span { color: var(--yellow); }

        /* ── Story section ────────────────────── */
        .story-section { background: #fff; padding: 100px 6%; }
        .story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .story-img-wrap {
          position: relative; border-radius: 24px; overflow: hidden;
          aspect-ratio: 4/3;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        }
        .story-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .story-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%);
        }
        .story-badge {
          position: absolute; bottom: 20px; left: 20px;
          background: var(--yellow); border-radius: 12px;
          padding: 10px 16px;
          font-size: 12px; font-weight: 700; color: #1a1a1a;
        }

        /* ── Values section ───────────────────── */
        .values-section { background: var(--light); padding: 100px 6%; }
        .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 60px; }
        .value-card {
          background: #fff; border-radius: 20px; padding: 32px;
          border: 1.5px solid rgba(0,0,0,0.07);
          transition: all 0.3s;
          cursor: default;
        }
        .value-card:hover {
          border-color: var(--yellow);
          box-shadow: 0 12px 40px rgba(245,197,24,0.12);
          transform: translateY(-4px);
        }
        .value-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, #fef9e7, #fef3c7);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(245,197,24,0.2);
        }
        .value-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #1a1a1a; margin-bottom: 8px; }
        .value-desc { font-size: 13px; color: #6b7280; line-height: 1.65; font-weight: 300; }

        /* ── Timeline ─────────────────────────── */
        .timeline-section { background: var(--dark); padding: 100px 6%; position: relative; overflow: hidden; }
        .timeline-line {
          position: absolute; left: 50%; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(180deg, transparent, rgba(245,197,24,0.4), transparent);
          transform: translateX(-50%);
        }
        .timeline-item {
          display: grid; grid-template-columns: 1fr 60px 1fr;
          gap: 20px; align-items: center; margin-bottom: 60px;
        }
        .timeline-item:last-child { margin-bottom: 0; }
        .timeline-content-left { text-align: right; }
        .timeline-content-right { text-align: left; }
        .timeline-dot {
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--yellow);
          box-shadow: 0 0 0 4px rgba(245,197,24,0.2), 0 0 20px rgba(245,197,24,0.4);
          margin: 0 auto;
          flex-shrink: 0;
        }
        .timeline-year {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 28px; color: var(--yellow); letter-spacing: -0.02em;
        }
        .timeline-title {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px;
          color: #fff; margin-bottom: 6px;
        }
        .timeline-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.65; font-weight: 300; }

        /* ── Design Build Market ──────────────── */
        .dbm-section {
          background: var(--dark2);
          padding: 100px 6%;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .dbm-bg {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(245,197,24,0.06) 0%, transparent 70%);
        }
        .dbm-title {
          font-size: clamp(3rem, 8vw, 7rem); color: #fff;
          margin-bottom: 24px;
        }
        .dbm-title .yellow { color: var(--yellow); }
        .dbm-title .dim { color: rgba(255,255,255,0.2); }

        /* ── Impact ───────────────────────────── */
        .impact-section { background: #fff; padding: 100px 6%; }
        .impact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 60px; }
        .impact-card {
          text-align: center; padding: 48px 24px;
          border-radius: 24px;
          background: var(--light);
          border: 1.5px solid rgba(0,0,0,0.07);
          position: relative; overflow: hidden;
        }
        .impact-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--yellow);
        }
        .impact-num {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: #1a1a1a; letter-spacing: -0.04em; line-height: 1;
        }
        .impact-label { font-size: 13px; color: #6b7280; margin-top: 8px; font-weight: 400; letter-spacing: 0.02em; }

        /* ── Team ─────────────────────────────── */
        .team-section { background: var(--light); padding: 100px 6%; }
        .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 60px; }
        .team-card {
          background: #fff; border-radius: 20px; overflow: hidden;
          border: 1.5px solid rgba(0,0,0,0.07);
          transition: all 0.3s;
        }
        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          border-color: var(--yellow);
        }
        .team-photo {
          aspect-ratio: 1; background: linear-gradient(135deg, #fef9e7, #fef3c7);
          display: flex; align-items: center; justify-content: center;
          font-size: 56px; position: relative;
        }
        .team-info { padding: 20px; }
        .team-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #1a1a1a; margin-bottom: 4px; }
        .team-role { font-size: 12px; color: #9ca3af; font-weight: 400; }

        /* ── Awards ───────────────────────────── */
        .awards-section { background: var(--dark); padding: 100px 6%; }
        .awards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 60px; }
        .award-card {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 32px;
          background: rgba(255,255,255,0.03);
          transition: all 0.3s; display: flex; align-items: flex-start; gap: 20px;
        }
        .award-card:hover {
          border-color: rgba(245,197,24,0.4);
          background: rgba(245,197,24,0.04);
          transform: translateY(-2px);
        }
        .award-icon {
          width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
          background: rgba(245,197,24,0.1); border: 1px solid rgba(245,197,24,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .award-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #fff; margin-bottom: 6px; }
        .award-org { font-size: 12px; color: rgba(255,255,255,0.35); }

        /* ── CTA Section ──────────────────────── */
        .cta-section {
          background: var(--yellow);
          padding: 100px 6%;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-bg {
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            rgba(0,0,0,0.03) 40px,
            rgba(0,0,0,0.03) 41px
          );
        }
        .cta-h2 { font-size: clamp(2.5rem, 6vw, 5rem); color: #1a1a1a; margin-bottom: 20px; }
        .cta-sub { font-size: 16px; color: rgba(26,26,26,0.6); max-width: 480px; margin: 0 auto 40px; font-weight: 300; }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: #1a1a1a; color: #fff;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 15px;
          border-radius: 100px; padding: 16px 36px;
          border: none; cursor: pointer; transition: all 0.3s;
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }
        .cta-btn:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }

        /* ── Section labels ───────────────────── */
        .section-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          border-radius: 100px; padding: 5px 14px; margin-bottom: 16px;
        }
        .section-tag-light {
          color: rgba(26,26,26,0.45);
          border: 1px solid rgba(26,26,26,0.1);
        }
        .section-tag-dark {
          color: var(--yellow);
          border: 1px solid rgba(245,197,24,0.25);
          background: rgba(245,197,24,0.06);
        }
        .tag-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--yellow); }

        /* ── Yellow highlight ─────────────────── */
        .hl {
          position: relative; display: inline-block;
        }
        .hl-inner { position: relative; z-index: 1; }
        .hl-bg {
          position: absolute; inset: -5px -4px;
          background: var(--yellow); border-radius: 10px; z-index: 0;
        }

        /* Responsive tweaks */
        @media (max-width: 768px) {
          .numbers-grid { grid-template-columns: 1fr; }
          .number-item:nth-child(odd) { border-right: none; padding-right: 0; }
          .number-item:nth-child(even) { padding-left: 0; }
          .story-grid { grid-template-columns: 1fr; gap: 40px; }
          .values-grid { grid-template-columns: 1fr 1fr; }
          .impact-grid { grid-template-columns: 1fr; }
          .team-grid { grid-template-columns: repeat(2, 1fr); }
          .awards-grid { grid-template-columns: 1fr; }
          .timeline-line { display: none; }
          .timeline-item { grid-template-columns: 1fr; text-align: left; }
          .timeline-content-left { text-align: left; }
          .timeline-dot { display: none; }
        }
        @media (max-width: 480px) {
          .values-grid { grid-template-columns: 1fr; }
          .team-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-stats { flex-wrap: wrap; }
          .hero-stat { min-width: 50%; }
        }
      `}</style>

      <div className="about-page" ref={pageRef}>
        {/* Scroll progress */}
        <motion.div className="scroll-progress" style={{ scaleX: progressBar }} />
        <div className="grain" />

        {/* ════════════ 1. HERO ════════════ */}
        <section className="hero-section" ref={heroRef}>
          <motion.img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
            alt="Bizpole office"
            className="hero-img"
            style={{ y: heroImgY }}
          />
          <div className="hero-bg" />

          <div className="hero-content mt-20">
            <Section>
             
              <motion.h1 variants={fadeUp} className="display hero-h1">
                Kerala's home-grown<br />
                <em>business platform</em><br />
                since 2012.
              </motion.h1>
              <motion.p variants={fadeUp} className="hero-sub">
                From a single office in Kerala to serving over 50,000 businesses nationwide — we've made compliance, legal, and financial services simple, fast, and accessible for every entrepreneur.
              </motion.p>
            </Section>
          </div>

          <div className="hero-stats" style={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
            {[
              { num: 50000, suf: "+", label: "Businesses Served" },
              { num: 13, suf: "+", label: "Years of Experience" },
              { num: 850, suf: "+", label: "Success Stories" },
              { num: 48, suf: "", label: "States & Territories" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="hero-stat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                style={{ paddingLeft: i === 0 ? 0 : 24, paddingRight: 24 }}
              >
                <div className="hero-stat-num">
                  <Counter to={s.num} suffix={s.suf} />
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════ 2. MARQUEE ════════════ */}
        <div className="marquee-section">
          <Marquee items={marqueeItems} speed={50} />
        </div>

        {/* ════════════ 3. BIG NUMBERS ════════════ */}
        <section className="numbers-section">
          {/* BG glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(245,197,24,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <Section>
            <motion.div variants={fadeUp} style={{ marginBottom: 48 }}>
              <span className="section-tag section-tag-dark"><span className="tag-dot" />By the Numbers</span>
              <h2 className="display text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 8 }}>Big Dreams, Bigger Results</h2>
            </motion.div>
          </Section>

          <div className="numbers-grid">
            {[
              { num: 850, suf: "+", label: "Success Stories", desc: "Businesses that started small and grew into industry leaders with our support." },
              { num: 650, suf: "+", label: "Expert Filings/Month", desc: "Our team processes hundreds of compliance filings monthly with near-zero error rate." },
              { num: 13, suf: "+", label: "Years of Experience", desc: "Over a decade of hands-on expertise in Indian business law and compliance." },
              { num: 99, suf: "%", label: "Client Satisfaction", desc: "Our clients rate us consistently above industry benchmarks for quality and speed." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="number-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{item.label}</div>
                  <p className="number-label-text">{item.desc}</p>
                </div>
                <div className="big-num">
                  <Counter to={item.num} suffix={<span style={{color:'var(--yellow)'}}>{item.suf}</span>} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════ 4. OUR STORY ════════════ */}
        <section className="story-section">
          <Section>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 60 }}>
              <span className="section-tag section-tag-light"><span className="tag-dot" />Our Story</span>
              <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginTop: 8 }}>
                From a small team to<br />a{" "}
                <span className="hl">
                  <span className="hl-inner">national platform</span>
                  <motion.span
                    className="hl-bg"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ originX: 0 }}
                  />
                </span>
              </h2>
            </motion.div>
          </Section>

          <div className="story-grid">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="story-img-wrap"
            >
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" alt="Our story" />
              <div className="story-img-overlay" />
              <div className="story-badge">Est. 2012 · Kerala, India</div>

              {/* Floating stat */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'rgba(14,14,15,0.85)', backdropFilter: 'blur(12px)',
                  borderRadius: 14, padding: '12px 16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: '#F5C518', letterSpacing: '-0.02em' }}>50K+</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Businesses served</div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}
            >
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 300 }}>
                Bizpole was born in 2012 from a simple observation: starting and running a business in India was unnecessarily complicated. Our founders, frustrated by the opaque, slow, and expensive world of business compliance, decided to build something better.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#6b7280', fontWeight: 300 }}>
                We started in a small office in Thrissur, Kerala, with a team of five. Today, we're a national platform serving over 50,000 businesses across 48 states and territories — but our mission has never changed: make every Indian entrepreneur's journey easier.
              </p>

              {/* Story cards */}
              {[
                { icon: "🎯", title: "Our Purpose", desc: "Empowering entrepreneurs with the tools, knowledge, and support they need to build great businesses." },
                { icon: "👥", title: "Our Team", desc: "180+ professionals including chartered accountants, lawyers, and tech engineers working as one team." },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                  style={{
                    background: '#f7f5f0', borderRadius: 16, padding: '20px 24px',
                    border: '1.5px solid rgba(0,0,0,0.07)',
                    display: 'flex', gap: 16, alignItems: 'flex-start',
                  }}
                  whileHover={{ x: 6, borderColor: 'rgba(245,197,24,0.4)' }}
                >
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{card.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>{card.title}</div>
                    <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, fontWeight: 300 }}>{card.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#d1d5db', fontSize: 16 }}>→</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ════════════ 5. VALUES ════════════ */}
        <section className="values-section">
          <Section>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 0 }}>
              <span className="section-tag section-tag-light"><span className="tag-dot" />What We Stand For</span>
              <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 8 }}>
                Our Core Values
              </h2>
              <p style={{ fontSize: 15, color: '#9ca3af', marginTop: 12, maxWidth: 440, margin: '12px auto 0', fontWeight: 300 }}>
                The principles that guide every decision, every product, every interaction.
              </p>
            </motion.div>
          </Section>

          <div className="values-grid">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                className="value-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="value-icon">{v.icon}</div>
                <div className="value-title">{v.title}</div>
                <div className="value-desc">{v.desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════ 6. TIMELINE ════════════ */}
        <section className="timeline-section">
          <div className="timeline-line" />
          <Section>
            <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 72 }}>
              <span className="section-tag section-tag-dark"><span className="tag-dot" />Our Journey</span>
              <h2 className="display text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', marginTop: 8 }}>
                Milestones That Matter
              </h2>
            </motion.div>
          </Section>

          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={m.year} className="timeline-item">
                  {isLeft ? (
                    <>
                      <motion.div
                        className="timeline-content-left"
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="timeline-year">{m.year}</div>
                        <div className="timeline-title">{m.title}</div>
                        <div className="timeline-desc">{m.desc}</div>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <div className="timeline-dot" />
                      </motion.div>
                      <div />
                    </>
                  ) : (
                    <>
                      <div />
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <div className="timeline-dot" />
                      </motion.div>
                      <motion.div
                        className="timeline-content-right"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="timeline-year">{m.year}</div>
                        <div className="timeline-title">{m.title}</div>
                        <div className="timeline-desc">{m.desc}</div>
                      </motion.div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════ 7. DESIGN. BUILD. MARKET. ════════════ */}
        <section className="dbm-section">
          <div className="dbm-bg" />
          <Section>
            <motion.div variants={fadeUp}>
              <h2 className="display dbm-title">
                <span className="yellow">Register.</span>{" "}
                <span style={{ color: '#fff' }}>Comply.</span>{" "}
                <span className="dim">Scale.</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 520, margin: '0 auto 40px', fontWeight: 300, lineHeight: 1.7 }}>
                Bizpole is your all-in-one business partner. From registering your company to managing compliance and scaling globally — we've got you covered at every stage.
              </p>
              <motion.button
                className="cta-btn"
                style={{ background: 'var(--yellow)', color: '#1a1a1a' }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/startbusiness")}
              >
                Get started today
                <span style={{ fontSize: 16 }}>→</span>
              </motion.button>
            </motion.div>
          </Section>
        </section>

        {/* ════════════ 8. IMPACT ════════════ */}
        <section className="impact-section">
          <Section>
            <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
              <span className="section-tag section-tag-light"><span className="tag-dot" />Our Impact</span>
              <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 8 }}>
                Numbers that speak
              </h2>
              <p style={{ fontSize: 15, color: '#9ca3af', marginTop: 12, fontWeight: 300 }}>
                Real results from real businesses we've empowered.
              </p>
            </motion.div>
          </Section>

          <div className="impact-grid">
            {[
              { num: 700, suf: "+", label: "In-house business advisors" },
              { num: 10, suf: "M", label: "Individuals impacted yearly" },
              { num: 100, suf: "+", label: "Cities with active clients" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="impact-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(245,197,24,0.1)' }}
              >
                <div className="impact-num">
                  <Counter to={item.num} suffix={item.suf} />
                </div>
                <div className="impact-label">{item.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ textAlign: 'center', marginTop: 48 }}
          >
            <motion.button
              className="cta-btn"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/services")}
            >
              See our impact →
            </motion.button>
          </motion.div>
        </section>

        {/* ════════════ 9. TEAM ════════════ */}


        {/* ════════════ 10. AWARDS ════════════ */}
        <section className="awards-section">
          <Section>
            <motion.div variants={fadeUp} style={{ marginBottom: 0 }}>
              <span className="section-tag section-tag-dark"><span className="tag-dot" />Recognition</span>
              <h2 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', marginTop: 8 }}>
                Awards & Accolades
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 12, maxWidth: 440, fontWeight: 300 }}>
                Industry recognition for our commitment to excellence.
              </p>
            </motion.div>
          </Section>

          <div className="awards-grid">
            {awards.map((award, i) => (
              <motion.div
                key={award.title}
                className="award-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="award-icon">🏆</div>
                <div>
                  <div className="award-title">{award.title}</div>
                  <div className="award-org">{award.org}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════ 11. CTA ════════════ */}
        <section className="cta-section">
          <div className="cta-bg" />
          <Section>
            <motion.div variants={fadeUp}>
              <h2 className="display cta-h2">
                Get started<br />today!
              </h2>
              <p className="cta-sub">
                It takes less than a minute to start your business journey. Join 50,000+ entrepreneurs who chose Bizpole.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  className="cta-btn"
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/startbusiness")}
                >
                  Start Your Business →
                </motion.button>
                <motion.button
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#1a1a1a', fontFamily: 'DM Sans', fontWeight: 700, fontSize: 15, borderRadius: 100, padding: '16px 28px', border: '2px solid rgba(26,26,26,0.25)', cursor: 'pointer' }}
                  whileHover={{ scale: 1.04, y: -2, borderColor: 'rgba(26,26,26,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/services")}
                >
                  View Services
                </motion.button>
              </div>
            </motion.div>
          </Section>
        </section>

      </div>
    </>
  );
}