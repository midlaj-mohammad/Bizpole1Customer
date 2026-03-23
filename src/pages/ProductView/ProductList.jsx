// 📁 src/components/ProductList.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

// ── Helper ────────────────────────────────────────────────────────────────────
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

// ── Ripple Component ──────────────────────────────────────────────────────────
function Ripple({ x, y, id, onDone }) {
  return (
    <motion.span
      key={id}
      style={{
        position: "fixed",
        left: x,
        top: y,
        translateX: "-50%",
        translateY: "-50%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,197,24,0.35) 0%, rgba(245,197,24,0.08) 60%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 9998,
        width: 8,
        height: 8,
      }}
      animate={{ width: 260, height: 260, opacity: [1, 0.5, 0] }}
      initial={{ width: 8, height: 8, opacity: 1 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={onDone}
    />
  );
}

// ── Custom Cursor ─────────────────────────────────────────────────────────────
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // Outer ring — lagging spring
  const springX = useSpring(cursorX, { stiffness: 120, damping: 18, mass: 0.6 });
  const springY = useSpring(cursorY, { stiffness: 120, damping: 18, mass: 0.6 });

  // Inner dot — snappy
  const dotSpringX = useSpring(dotX, { stiffness: 500, damping: 30 });
  const dotSpringY = useSpring(dotY, { stiffness: 500, damping: 30 });

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);

  useEffect(() => {
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    };

    const down = (e) => {
      setClicked(true);
      // Spawn ripple
      const id = ++rippleId.current;
      setRipples(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
    };

    const up = () => {
      setClicked(false);
    };

    const over = (e) => {
      const el = e.target;
      const isInteractive =
        el.tagName === "BUTTON" ||
        el.tagName === "A" ||
        el.closest("button") ||
        el.closest("a") ||
        el.tagName === "IMG" ||
        el.closest("[data-cursor-hover]") ||
        window.getComputedStyle(el).cursor === "pointer";
      setHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseover", over);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseover", over);
    };
  }, [cursorX, cursorY, dotX, dotY]);

  const removeRipple = useCallback((id) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <>
      {/* Ripples */}
      <AnimatePresence>
        {ripples.map(r => (
          <Ripple key={r.id} x={r.x} y={r.y} id={r.id} onDone={() => removeRipple(r.id)} />
        ))}
      </AnimatePresence>

      {/* Outer ring */}
      <motion.div
        style={{
          position: "fixed",
          left: springX,
          top: springY,
          translateX: "-50%",
          translateY: "-50%",
          pointerEvents: "none",
          zIndex: 9999,
          borderRadius: "50%",
          border: `2px solid ${hovered ? "#F5C518" : "rgba(245,197,24,0.6)"}`,
          background: hovered ? "rgba(245,197,24,0.08)" : "transparent",
          mixBlendMode: "normal",
        }}
        animate={{
          width: clicked ? 28 : hovered ? 48 : 38,
          height: clicked ? 28 : hovered ? 48 : 38,
          borderColor: hovered ? "#F5C518" : "rgba(245,197,24,0.6)",
          opacity: clicked ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      />

      {/* Inner dot */}
      <motion.div
        style={{
          position: "fixed",
          left: dotSpringX,
          top: dotSpringY,
          translateX: "-50%",
          translateY: "-50%",
          pointerEvents: "none",
          zIndex: 9999,
          borderRadius: "50%",
          background: "#F5C518",
        }}
        animate={{
          width: clicked ? 14 : hovered ? 6 : 8,
          height: clicked ? 14 : hovered ? 6 : 8,
          opacity: hovered ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
const ProductList = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    import("../../api/Products").then(({ getProducts }) => {
      getProducts()
        .then((data) => setProducts(data.products || data || []))
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    });
  }, []);

  return (
    <>
      <style>{`
        /* Hide default cursor globally on this page */
        .product-page, .product-page * { cursor: none !important; }
      `}</style>

      {/* Custom cursor — rendered outside scroll flow */}
      <CustomCursor />

      <div className="product-page">
        {/* ── Hero ── */}
        <section className="pt-20 min-h-[90vh] flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-yellow-50">
          <motion.div
            className="inline-block px-4 py-1 mb-12 border border-yellow-400 rounded-full text-sm text-yellow-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Bizpole suite
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Introducing <br />
            <span className="text-yellow-500">Bizpole Products</span>
          </motion.h1>

          <motion.p
            className="text-gray-700 text-lg max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            A unified solution, designed particularly to manage, develop, and
            enhance your eCommerce ecosystem.
          </motion.p>
        </section>

        {/* ── Products ── */}
        <section className="py-12 px-4 mx-auto bg-gradient-to-t from-white to-yellow-50">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <motion.div
                  className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="ml-4 text-yellow-500 font-semibold text-lg">Loading products...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">No products available at the moment.</p>
              </div>
            ) : (
              <motion.div
                className="space-y-16"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
                }}
              >
                <AnimatePresence>
                  {products.map((product, idx) => (
                    <motion.div
                      key={product.id || idx}
                      data-cursor-hover
                      className={`flex flex-col ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-15 mb-30 items-center`}
                      initial={{ opacity: 0, y: 40, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 40, scale: 0.98 }}
                      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {/* Product Image */}
                      <div className="w-full md:w-1/2">
                        {product.icon_url?.data && Array.isArray(product.icon_url.data) ? (
                          <img
                            src={`data:image/png;base64,${arrayBufferToBase64(product.icon_url.data)}`}
                            alt={product.name || product.ProductName}
                            className="w-full h-95 object-cover rounded-2xl shadow-lg"
                          />
                        ) : product.image ? (
                          <img
                            src={product.image}
                            alt={product.name || product.ProductName}
                            className="w-full h-80 object-cover rounded-2xl shadow-lg bg-gray-50"
                          />
                        ) : (
                          <div className="w-full h-80 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg flex items-center justify-center">
                            <span className="text-gray-400 text-lg">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Content */}
                      <div className="w-full md:w-1/2 space-y-4">
                        <h3 className="text-3xl md:text-4xl font-semibold text-gray-900">
                          {product.name || product.ProductName}
                        </h3>
                        <p className="text-gray-600 text-base leading-relaxed">
                          {product.description || product.Description || "No description available."}
                        </p>
                        {product.price && (
                          <div className="text-yellow-500 font-bold text-2xl">₹{product.price}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductList;