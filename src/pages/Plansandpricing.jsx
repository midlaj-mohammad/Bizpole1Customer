import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPackagesByServiceType, getAllServiceTypes } from "../api/ServiceType";
import { upsertQuote } from "../api/Quote";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, Sparkles, ArrowRight } from "lucide-react";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

const PlansAndPricing = () => {
  const [activeTab, setActiveTab] = useState("packages"); // "packages" or "services"
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);

  // Handle package quote creation
  const handlePackageQuote = async (plan) => {
    try {
      const quoteData = {
        packageId: plan.id || plan.packageId || plan.PackageID,
        packageName: plan.name || plan.PackageName || plan.packageName,
        amount: plan.price || plan.YearlyMRP || plan.amount,
        type: "package",
      };

      const data = await upsertQuote(quoteData);

      if (data && data.QuoteID) {
        const user = getSecureItem("user");
        if (user) {
          user.QuoteID = data.QuoteID;
          setSecureItem("user", user);
        }
      }

      alert(`Package quote created! QuoteCode: ${data.QuoteCode}`);
      navigate("/dashboard/bizpoleone");
    } catch (err) {
      console.error("Error creating package quote:", err);
      alert("Failed to create package quote.");
    }
  };

  // Handle individual service selection
  const toggleServiceSelection = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.ID === service.ID);
      if (exists) {
        return prev.filter((s) => s.ID !== service.ID);
      } else {
        return [...prev, service];
      }
    });
  };

  // Handle individual services quote creation
  const handleServicesQuote = async () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }

    try {
      const totalAmount = selectedServices.reduce(
        (sum, service) => sum + (service.Price || service.price || 0),
        0
      );

      const quoteData = {
        services: selectedServices.map((s) => ({
          serviceId: s.ID,
          serviceName: s.ServiceName,
          price: s.Price || s.price,
        })),
        amount: totalAmount,
        type: "individual",
      };

      const data = await upsertQuote(quoteData);

      if (data && data.QuoteID) {
        const user = getSecureItem("user");
        if (user) {
          user.QuoteID = data.QuoteID;
          setSecureItem("user", user);
        }
      }

      alert(`Services quote created! QuoteCode: ${data.QuoteCode}`);
      navigate("/dashboard/bizpoleone");
    } catch (err) {
      console.error("Error creating services quote:", err);
      alert("Failed to create services quote.");
    }
  };

  // Fetch business types (service types) if not present
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const types = await getAllServiceTypes();
        setBusinessTypes(Array.isArray(types) ? types : []);
      } catch (err) {
        // ignore error, fallback to error in main fetch
      }
    };
    fetchBusinessTypes();
  }, []);

  // Fetch packages and services
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let typeId = null;
        if (selectedTypeId) {
          typeId = selectedTypeId;
        } else if (location?.state?.type) {
          typeId = location.state.type;
        } else {
          const loc = getSecureItem("location");
          if (loc && loc.type) {
            typeId = loc.type;
          }
        }

        if (!typeId) {
          setPackages([]);
          setServices([]);
          setLoading(false);
          return;
        }

        const data = await getPackagesByServiceType(typeId);
        if (data && Array.isArray(data)) {
          setPackages(data);
          // Extract unique services
          const allServices = data.reduce((acc, pkg) => {
            if (pkg.services && Array.isArray(pkg.services)) {
              pkg.services.forEach((service) => {
                if (!acc.find((s) => s.ID === service.ID)) {
                  acc.push(service);
                }
              });
            }
            return acc;
          }, []);
          setServices(allServices);
        } else {
          setPackages([]);
          setServices([]);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load pricing information");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location, selectedTypeId]);

  const calculateTotal = () => {
    return selectedServices.reduce(
      (sum, service) => sum + (service.Price || service.price || 0),
      0
    );
  };

  // ✅ Tab Navigation Logic
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "services") {
      navigate("/services"); // 👈 Redirect to services page
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Choose Your Perfect <span className="text-[#F3C625]">Plan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Select from our comprehensive packages or build your own custom
            solution with individual services
          </motion.p>
        </div>

        {/* Business Type Selector if not selected */}
        {!selectedTypeId && businessTypes.length > 0 && (
          <div className="mb-10 max-w-xl mx-auto">
            <label className="block mb-2 text-lg font-semibold text-gray-700">Select Business Type</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring focus:ring-yellow-200"
              value={selectedTypeId || ""}
              onChange={e => setSelectedTypeId(e.target.value)}
            >
              <option value="">-- Choose Business Type --</option>
              {businessTypes.map(type => (
                <option key={type.Id} value={type.Id}>{type.Service_Name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-lg inline-flex">
            <button
              onClick={() => handleTabClick("packages")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === "packages"
                  ? "bg-[#F3C625] text-black shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Packages
            </button>
            <button
              onClick={() => handleTabClick("services")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === "services"
                  ? "bg-[#F3C625] text-black shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Individual Services
            </button>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F3C625]"></div>
            <p className="mt-4 text-gray-600">Loading options...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        )}

        {/* Packages Content */}
        {!loading && !error && selectedTypeId && (
          <AnimatePresence mode="wait">
            {activeTab === "packages" && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {packages.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    No packages available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {packages.map((plan, i) => (
                      <motion.div
                        key={plan.id || plan.packageId || i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: i * 0.1,
                          type: "spring",
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.03,
                          y: -10,
                        }}
                        onHoverStart={() => setHoveredCard(i)}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="relative rounded-2xl p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-[#F3C625] flex flex-col"
                      >
                        {i === 1 && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-[#F3C625] text-black px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Sparkles size={12} /> POPULAR
                            </span>
                          </div>
                        )}

                        <div className="absolute top-4 right-4">
                          <span className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <Calendar size={12} /> Yearly
                          </span>
                        </div>

                        <div className="mt-6 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {plan.name ||
                              plan.PackageName ||
                              plan.packageName}
                          </h3>
                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-4xl font-bold text-gray-900">
                              ₹
                              {plan.price ||
                                plan.YearlyMRP ||
                                plan.amount}
                            </span>
                            <span className="text-gray-500">/year</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {plan.description || plan.Description}
                          </p>
                          <p className="text-sm font-medium text-[#F3C625]">
                            {plan.audience || plan.Audience}
                          </p>
                        </div>

                        <div className="border-t border-gray-200 my-4"></div>

                        <div className="flex-1">
                          {plan.services &&
                            Array.isArray(plan.services) && (
                              <ul className="space-y-3">
                                {plan.services
                                  .slice(0, 5)
                                  .map((service, idx) => (
                                    <li
                                      key={service.ID || idx}
                                      className="flex items-start gap-2 text-gray-700"
                                    >
                                      <div className="bg-[#F3C625] bg-opacity-20 p-1 rounded mt-0.5">
                                        <Check
                                          size={14}
                                          className="text-[#F3C625]"
                                        />
                                      </div>
                                      <span className="text-sm">
                                        {service.ServiceName}
                                      </span>
                                    </li>
                                  ))}
                                {plan.services.length > 5 && (
                                  <li className="text-sm text-gray-500 pl-6">
                                    +{plan.services.length - 5} more services
                                  </li>
                                )}
                              </ul>
                            )}
                        </div>

                        <button
                          onClick={() => handlePackageQuote(plan)}
                          className="w-full mt-6 bg-[#F3C625] hover:bg-[#d4ab1f] text-black font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                          Get Quote
                          <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default PlansAndPricing;
