import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform, useSpring } from "framer-motion";

const GlobalStats = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const imageInView = useInView(imageRef, { once: true, margin: "-80px" });

  // Scroll-driven parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });
  const scale = useTransform(scrollYProgress, [0, 0.4, 1], [0.92, 1, 1.02]);
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 1], [8, 0, -2]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
  };

  const fadeUp = {
    hidden: { y: 40, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .gs-section {
          font-family: 'DM Sans', sans-serif;
          background: #f7f5f0;
          position: relative;
          overflow: hidden;
        }

        .gs-grain {
          position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .gs-blob {
          position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none;
        }

        .gs-display {
          font-family: 'Syne', sans-serif;
          font-weight: 400;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .gs-image-perspective {
          perspective: 1400px;
        }

        /* Clip-path curtain reveal */
        .gs-curtain {
          clip-path: inset(100% 0 0 0);
          transition: clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gs-curtain.revealed {
          clip-path: inset(0% 0 0 0);
        }

        .gs-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(26,26,26,0.45);
          border: 1px solid rgba(26,26,26,0.1);
          border-radius: 100px;
          padding: 5px 14px;
        }
      `}</style>

      <section ref={sectionRef} className="gs-section py-20 md:py-32">
        <div className="gs-grain" />
        {/* Blobs */}
        <div className="gs-blob w-96 h-96 bg-[#F5C518] opacity-[0.1] -top-24 -left-24" />
        <div className="gs-blob w-72 h-72 bg-[#3B82F6] opacity-[0.05] bottom-0 right-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">

          {/* ── Header ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="text-center mb-14 space-y-5"
          >
            <motion.div variants={fadeUp}>
              <span className="gs-tag">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse" />
                Platform Features
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="gs-display text-[#1a1a1a] text-4xl md:text-6xl">
              Everything your{" "}
              <span className="relative inline-block">
                <span className="relative z-10">team</span>
                <motion.span
                  className="absolute inset-[-6px_-4px] bg-[#F5C518] rounded-2xl z-0"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ originX: 0 }}
                />
              </span>{" "}
              needs
            </motion.h2>

            <motion.p variants={fadeUp}
              className="text-[#1a1a1a]/50 text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
              One platform to manage, track, and collaborate on every financial decision — in real time.
            </motion.p>
          </motion.div>

          {/* ── Image Block ── */}
          <motion.div
            ref={imageRef}
            style={{ y, scale }}
            className="gs-image-perspective relative"
          >
            {/* Glow behind image */}
            <motion.div
              style={{ opacity: shadowOpacity }}
              className="absolute inset-x-10 bottom-[-30px] h-24 bg-[#F5C518]/25 blur-3xl rounded-full z-0"
            />

            {/* 3D rising + curtain reveal wrapper */}
            <motion.div
              style={{ rotateX }}
              initial={{ rotateX: 8, y: 60, opacity: 0 }}
              animate={imageInView
                ? { rotateX: 0, y: 0, opacity: 1 }
                : { rotateX: 8, y: 60, opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              {/* Curtain overlay that slides up */}
              <motion.div
                initial={{ scaleY: 1, originY: 0 }}
                animate={imageInView ? { scaleY: 0 } : { scaleY: 1 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.76, 0, 0.24, 1] }}
                style={{ originY: 0 }}
                className="absolute inset-0 bg-[#F5C518] z-20 rounded-2xl pointer-events-none"
              />

              {/* The image */}
              <div className="rounded-2xl overflow-hidden ring-1 ring-black/8 shadow-2xl p-18">
                <motion.img
                  src="public/Images/Feature.png"
                  alt="Platform Features"
                  className="w-full h-auto block"
                  initial={{ scale: 1.08 }}
                  animate={imageInView ? { scale: 1 } : { scale: 1.08 }}
                  transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Corner accent dots */}
              {[
                "top-4 left-4",
                "top-4 right-4",
                "bottom-4 left-4",
                "bottom-4 right-4",
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${pos} w-2 h-2 rounded-full bg-[#F5C518] z-30`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={imageInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 1 + i * 0.08, duration: 0.3 }}
                />
              ))}
            </motion.div>

       

            {/* Floating badge — right */}
        
          </motion.div>

      

        </div>
      </section>
    </>
  );
};

export default GlobalStats;