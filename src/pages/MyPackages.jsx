import React, { useState, useEffect } from "react";
import { getPackageOrders } from "../api/Orders/Order";
import { getSecureItem } from "../utils/secureStorage";


const PAGE_SIZE = 10;

const MyPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(() => {
    try {
      const raw = getSecureItem("selectedCompany");
      return raw && typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const companyId = selectedCompany?.CompanyID || selectedCompany?.CompanyId || null;
        const res = await getPackageOrders({ page, limit: PAGE_SIZE, CompanyID: companyId });
        const data = res.data || res.orders || res;
        setPackages(Array.isArray(data) ? data : []);
        const total = res.total || res.count || (res.meta && res.meta.total) || (Array.isArray(res.data) ? res.total : 0);
        setTotalCount(total || 0);
        setTotalPages(total ? Math.ceil(total / PAGE_SIZE) : 1);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError("Failed to load your packages.");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [page, selectedCompany]);

  useEffect(() => {
    // Listen for company switch event and update selectedCompany state immediately
    const handleCompanySwitch = () => {
      let parsed = null;
      try {
        const raw = getSecureItem("selectedCompany") || window.localStorage.getItem("selectedCompany") || window.sessionStorage.getItem("selectedCompany");
        parsed = raw && typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {}
      setSelectedCompany(parsed);
      setPage(1);
    };
    window.addEventListener("company-switched", handleCompanySwitch);
    return () => {
      window.removeEventListener("company-switched", handleCompanySwitch);
    };
  }, []);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading packages...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!packages.length) {
    return <div className="text-center py-20 text-gray-500">No package orders found.</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">My Package Orders</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">
              {pkg.PackageName || pkg.PackageTitle || "Unnamed Package"}
            </h2>

            <p className="text-gray-600 text-sm mb-2">
              Order ID: <span className="font-medium">{pkg.OrderID || pkg.id}</span>
            </p>

            <p className="text-gray-600 text-sm mb-2">
              Total Amount: {" "}
              <span className="font-medium">
                ₹{pkg.TotalAmount || pkg.totalAmount || "N/A"}
              </span>
            </p>

            <p className="text-gray-600 text-sm mb-2">
              Status: {" "}
              <span
                className={`font-medium ${
                  pkg.Status === "Completed"
                    ? "text-green-600"
                    : pkg.Status === "Pending"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {pkg.Status || "Unknown"}
              </span>
            </p>

            <p className="text-gray-600 text-sm mb-4">
              Ordered On: {" "}
              {pkg.CreatedDate
                ? new Date(pkg.CreatedDate).toLocaleDateString()
                : "N/A"}
            </p>

            <button
              onClick={() => alert(`Viewing details for Order #${pkg.OrderID}`)}
              className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className={`px-4 py-2 rounded-xl border ${page === 1 ? "bg-gray-200 text-gray-400" : "bg-white hover:bg-gray-100"}`}
        >
          Previous
        </button>
        <span className="font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded-xl border ${page === totalPages || totalPages === 0 ? "bg-gray-200 text-gray-400" : "bg-white hover:bg-gray-100"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MyPackages;
