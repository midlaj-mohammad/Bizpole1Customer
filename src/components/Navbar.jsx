import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import SigninModal from "./Modals/SigninModal";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const navItems = [
    { label: "Services", path: "/services" },
    { label: "Product", path: "/products" },
    { label: "Bizpole One", path: "/bizpoleone" },
    { label: "Partners", path: "/partners" },
    { label: "Companies", path: "/companies" },
  ];




  // ✅ Auto-open Signin Modal if redirected from Compliance page
  useEffect(() => {
    if (location.state?.openSigninModal) {
      setShowSignin(true);
      // Prevent re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);



  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      localStorage.setItem("PartnerID", ref);
    }
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-gray-200 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"
          }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between py-4 md:py-5">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center"
          >
            <img
              src="/Images/logo.webp"
              alt="Bizpole Logo"
              className="h-12 md:h-14 lg:h-16"
            />
          </div>

          {/* Desktop Menu */}
          <ul className="navitems hidden md:flex gap-6 lg:gap-10 xl:gap-12 font-medium text-sm md:text-base lg:text-lg">
            {navItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`transition navli cursor-pointer ${isScrolled
                    ? "text-gray-900 hover:text-black"
                    : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-6">
            {hasToken ? (
              // ✅ If token found → show Go to Dashboard
              <motion.button
                whileHover="hover"
                initial="rest"
                animate="rest"
                onClick={() => navigate("/dashboard/bizpoleone")}
                className="relative overflow-hidden px-4 lg:px-6 py-2 text-sm lg:text-base font-medium rounded-full cursor-pointer bg-[#F3C625] text-white shadow-md"
              >
                <motion.span
                  variants={{
                    rest: { width: "0%", opacity: 0 },
                    hover: { width: "100%", opacity: 1 },
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute left-1/2 top-0 h-full bg-[#000] -translate-x-1/2"
                />
                <span className="relative z-10">Go Dashboard</span>
              </motion.button>
            ) : (
              <>
                {/* Sign In Button */}
                <motion.button
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                  onClick={() => setShowSignin(true)}
                  className="relative overflow-hidden px-4 lg:px-6 py-2 text-sm lg:text-base font-medium rounded-full cursor-pointer bg-[#fbbf24] text-black"
                >
                  <motion.span
                    variants={{
                      rest: { width: "0%", opacity: 0 },
                      hover: { width: "100%", opacity: 1 },
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`absolute left-1/2 top-0 h-full ${isScrolled ? "bg-white" : "bg-[#fbbf24]"
                      } -translate-x-1/2`}
                  />
                  <span className="relative z-10">Sign In</span>
                </motion.button>

                {/* Get Start Your Business */}
                <motion.button
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                  onClick={() => navigate("/startbusiness")}
                  className="relative overflow-hidden px-4 lg:px-6 py-2 text-sm lg:text-base font-semibold rounded-full text-black cursor-pointer bg-white shadow-md"
                >
                  <motion.span
                    variants={{
                      rest: { width: "0%", opacity: 0 },
                      hover: { width: "100%", opacity: 1 },
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute left-1/2 top-0 h-full bg-[#fbbf24] -translate-x-1/2"
                  />
                  <span className="relative z-10">
                    Get Start Your <span className="font-bold">Business</span>
                  </span>
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden ${isScrolled ? "text-gray-800" : "text-black"
              }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white shadow-lg"
            >
              <ul className="flex flex-col px-6 py-4 space-y-4 text-gray-800 text-base">
                {navItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className="w-full text-left hover:text-black transition"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}

                {/* Mobile Conditional Buttons */}
                <li>
                  {hasToken ? (
                    <motion.button
                      whileHover="hover"
                      initial="rest"
                      animate="rest"
                      onClick={() => {
                        navigate("/dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="relative overflow-hidden w-full py-2 rounded-full bg-[#F3C625] text-white font-medium"
                    >
                      <motion.span
                        variants={{
                          rest: { width: "0%", opacity: 0 },
                          hover: { width: "100%", opacity: 1 },
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute left-1/2 top-0 h-full bg-[#F3C625] text-black -translate-x-1/2"
                      />
                      <span className="relative z-10">Go to Dashboard</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover="hover"
                      initial="rest"
                      animate="rest"
                      onClick={() => setShowSignin(true)}
                      className="relative overflow-hidden w-full py-2 rounded-full bg-[#fbbf24] text-black font-medium"
                    >
                      <motion.span
                        variants={{
                          rest: { width: "0%", opacity: 0 },
                          hover: { width: "100%", opacity: 1 },
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute left-1/2 top-0 h-full bg-[#facc15] -translate-x-1/2"
                      />
                      <span className="relative z-10">Sign In</span>
                    </motion.button>
                  )}
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ✅ Signin Modal */}
      <SigninModal isOpen={showSignin} onClose={() => setShowSignin(false)} />
    </>
  );
}
