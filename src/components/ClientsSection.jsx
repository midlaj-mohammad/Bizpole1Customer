import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";

const testimonials = [
  {
    name: "Amelia Joseph",
    role: "Chief Manager",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "My vision came alive effortlessly. Their blend of casual and professional approach made the process a breeze. Creativity flowed, and the results were beyond my expectations.",
    featured: true,
  },
  {
    name: "Jacob Joshua",
    role: "Chief Manager",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "I found the digital expertise I needed. Their creative-professional balance exceeded expectations. Friendly interactions, exceptional outcomes. For digital enchantment, it's got to be Bizpole!",
    featured: false,
  },
  {
    name: "Sarah Williams",
    role: "CEO, TechVentures",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "Embrace really nails it! Creative, approachable style. They're the place where artistry meets strategy. Thrilled with what we achieved together!",
    featured: false,
  },
  {
    name: "Marcus Chen",
    role: "Founder, NovaBiz",
    img: "https://randomuser.me/api/portraits/men/75.jpg",
    text: "Working with the team was a transformative experience. They understood our vision instantly and delivered results that far exceeded what we imagined possible.",
    featured: false,
  },
  {
    name: "Priya Mehta",
    role: "Director of Operations",
    img: "https://randomuser.me/api/portraits/women/26.jpg",
    text: "The platform simplifies everything. Our entire finance team was onboarded in a day. The dashboard is intuitive, beautiful, and genuinely saves us hours every week.",
    featured: false,
  },
  {
    name: "Liam Okafor",
    role: "Head of Growth",
    img: "https://randomuser.me/api/portraits/men/18.jpg",
    text: "Outstanding execution across every touchpoint. The attention to detail and responsiveness of the team is unmatched. Highly recommend to any scaling business.",
    featured: false,
  },
];

// ── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F5C518">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ── Single Card ──────────────────────────────────────────────────────────────
function TestimonialCard({ item, index, active }) {
  const isFeatured = index === active;
  const isNext = index === (active + 1) % testimonials.length;

  return (
    <motion.div
      layout
      className={`relative flex-shrink-0 rounded-[20px] p-6 flex flex-col gap-4 cursor-pointer select-none
        transition-all duration-500
        ${isFeatured
          ? "bg-[#F5C518] shadow-2xl shadow-[#F5C518]/30 w-99 md:w-108"
          : "bg-[#e8e5de] w-80 md:w-80"
        }`}
      style={{
        opacity: isFeatured ? 1 : isNext ? 0.85 : 0.6,
        scale: isFeatured ? 1 : 0.97,
      }}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: isFeatured ? 1 : isNext ? 0.85 : 0.6, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Quote mark */}
      <div className={`absolute top-4 right-5 text-5xl font-serif leading-none select-none
        ${isFeatured ? "text-[#1a1a1a]/15" : "text-[#1a1a1a]/10"}`}>
        "
      </div>

      {/* Author */}
      <div className="flex items-center gap-3">
        <img
          src={item.img}
          alt={item.name}
          className={`w-12 h-12 rounded-full object-cover ring-2
            ${isFeatured ? "ring-white/60" : "ring-white/40"}`}
        />
        <div>
          <div className={`font-bold text-sm leading-tight
            ${isFeatured ? "text-[#1a1a1a]" : "text-[#1a1a1a]"}`}>
            {item.name}
          </div>
          <div className={`text-xs mt-0.5 ${isFeatured ? "text-[#1a1a1a]/60" : "text-[#1a1a1a]/50"}`}>
            {item.role}
          </div>
        </div>
      </div>

      <Stars />

      {/* Text */}
      <p className={`text-sm leading-relaxed ${isFeatured ? "text-[#1a1a1a]/80" : "text-[#1a1a1a]/65"}`}>
        {item.text}
      </p>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientsSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const trackRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const dragStartX = useRef(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const prev = () => {
    setDirection(-1);
    setActive((p) => (p - 1 + testimonials.length) % testimonials.length);
  };
  const next = () => {
    setDirection(1);
    setActive((p) => (p + 1) % testimonials.length);
  };

  // Visible cards: active + next 2
  const visible = [0, 1, 2].map((offset) => ({
    item: testimonials[(active + offset) % testimonials.length],
    index: offset,
  }));

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
  const fadeUp = {
    hidden: { y: 32, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .cs-section { font-family: 'DM Sans', sans-serif; background: #f7f5f0; position: relative; overflow: hidden; }
        .cs-grain {
          position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.032;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }
        .cs-blob { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }
        .cs-display { font-family: 'Syne', sans-serif; font-weight: 500; letter-spacing: -0.03em; line-height: 1.05; }
        .cs-track::-webkit-scrollbar { display: none; }
        .cs-track { -ms-overflow-style: none; scrollbar-width: none; }
        .nav-btn {
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none; transition: all 0.25s;
          font-size: 18px;
        }
        .nav-btn-outline {
          background: transparent;
          border: 1.5px solid rgba(26,26,26,0.2) !important;
          color: rgba(26,26,26,0.5);
        }
        .nav-btn-outline:hover { border-color: rgba(26,26,26,0.5) !important; color: #1a1a1a; }
        .nav-btn-yellow { background: #F5C518; color: #1a1a1a; box-shadow: 0 6px 20px rgba(245,197,24,0.4); }
        .nav-btn-yellow:hover { transform: scale(1.08); box-shadow: 0 8px 28px rgba(245,197,24,0.55); }
      `}</style>

      <section ref={sectionRef} className="cs-section py-20 md:py-28">
        <div className="cs-grain" />
        <div className="cs-blob w-96 h-96 bg-[#F5C518] opacity-[0.09] -top-20 -right-20" />
        <div className="cs-blob w-72 h-72 bg-[#3B82F6] opacity-[0.05] bottom-0 left-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

          {/* ── Header row ── */}
          <motion.div
            ref={headRef}
            variants={stagger}
            initial="hidden"
            animate={headInView ? "show" : "hidden"}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          >
            <div className="space-y-3 max-w-xl">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[#1a1a1a]/45 border border-[#1a1a1a]/10 rounded-full px-4 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse inline-block" />
                  Client Stories
                </span>
              </motion.div>

              <motion.h2 variants={fadeUp} className="cs-display text-[#1a1a1a] text-3xl md:text-5xl">
                What Our{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Clients</span>
                  <motion.span
                    className="absolute inset-[-5px_-3px] bg-[#F5C518] rounded-xl z-0"
                    initial={{ scaleX: 0 }}
                    animate={headInView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ originX: 0 }}
                  />
                </span>{" "}
                Said About Us
              </motion.h2>
            </div>

            {/* Nav buttons */}
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              {/* Progress indicator */}
              <div className="hidden md:flex items-center gap-1.5 mr-2">
                {testimonials.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === active ? 24 : 6,
                      background: i === active ? "#F5C518" : "rgba(26,26,26,0.15)",
                    }}
                    transition={{ duration: 0.35 }}
                    className="h-1.5 rounded-full cursor-pointer"
                    onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
                  />
                ))}
              </div>

              <motion.button
                className="nav-btn nav-btn-outline"
                onClick={prev}
                whileTap={{ scale: 0.9 }}
                whileHover={{ x: -2 }}
              >
                ←
              </motion.button>
              <motion.button
                className="nav-btn nav-btn-yellow"
                onClick={next}
                whileTap={{ scale: 0.9 }}
                whileHover={{ x: 2 }}
              >
                →
              </motion.button>
            </motion.div>
          </motion.div>

          {/* ── Cards Track ── */}
          <motion.div
            style={{ y: bgY }}
            className="relative"
          >
            {/* Fade-out edge right */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f7f5f0] to-transparent z-10 pointer-events-none" />

            <motion.div
              ref={trackRef}
              className="cs-track flex justify-between gap-5 overflow-x-auto pb-4 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragStart={(_, info) => { dragStartX.current = info.point.x; }}
              onDragEnd={(_, info) => {
                const delta = info.point.x - dragStartX.current;
                if (delta < -40) next();
                else if (delta > 40) prev();
              }}
            >
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                {visible.map(({ item, index }) => (
                  <motion.div
                    key={`${active}-${index}`}
                    custom={direction}
                    variants={{
                      enter: (d) => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
                      center: { x: 0, opacity: 1, scale: 1 },
                      exit: (d) => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <TestimonialCard item={item} index={index} active={0} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* ── Bottom summary bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-14 pt-10 border-t border-[#1a1a1a]/8 grid grid-cols-3 gap-6 text-center"
          >
            {[
              { val: "10K+", label: "Happy Clients" },
              { val: "4.9★", label: "Average Rating" },
              { val: "98%", label: "Satisfaction Rate" },
            ].map((s) => (
              <div key={s.label}>
                <div className="cs-display text-2xl md:text-3xl text-[#1a1a1a]">{s.val}</div>
                <div className="text-xs text-[#1a1a1a]/40 uppercase tracking-wider mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
}