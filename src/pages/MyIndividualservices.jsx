import React, { useState, useEffect } from "react";
import { getIndividualOrders } from "../api/Orders/Order";


const PAGE_SIZE = 10;

const MyIndividualServices = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let switched = false;
    // Get selectedCompany from secure storage
    const raw = window.localStorage.getItem("selectedCompany") || window.sessionStorage.getItem("selectedCompany");
    let selectedCompanyId = null;
    if (raw) {
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        selectedCompanyId = parsed && parsed.CompanyID ? parsed.CompanyID : null;
      } catch (e) {
        selectedCompanyId = null;
      }
    }
    const fetchIndividualOrdersData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pass selectedCompanyId explicitly for clarity
        const res = await getIndividualOrders({ page, limit: PAGE_SIZE, CompanyID: selectedCompanyId });
        const data = res.data || res.orders || res;
        setOrders(Array.isArray(data) ? data : []);
        const total = res.total || res.count || (res.meta && res.meta.total) || (Array.isArray(res.data) ? res.total : 0);
        setTotalCount(total || 0);
        setTotalPages(total ? Math.ceil(total / PAGE_SIZE) : 1);
      } catch (err) {
        console.error("Error fetching individual orders:", err);
        setError("Failed to load your individual service orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchIndividualOrdersData();
    // Listen for company switch event
    const handleCompanySwitch = () => {
      if (!switched) {
        switched = true;
        setPage(1);
      }
    };
    window.addEventListener("company-switched", handleCompanySwitch);
    return () => {
      window.removeEventListener("company-switched", handleCompanySwitch);
    };
  }, [page, window.localStorage.getItem("selectedCompany")]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading services...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!orders.length) {
    return <div className="text-center py-20 text-gray-500">No individual service orders found.</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">My Individual Service Orders</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">
              {order.ServiceName || "Unnamed Service"}
            </h2>

            <p className="text-gray-600 text-sm mb-2">
              Order ID: <span className="font-medium">{order.OrderID || order.id}</span>
            </p>

            <p className="text-gray-600 text-sm mb-2">
              Price:{" "}
              <span className="font-medium">
                ₹{order.TotalAmount || order.Price || "N/A"}
              </span>
            </p>

            <p className="text-gray-600 text-sm mb-2">
              Status:{" "}
              <span
                className={`font-medium ${
                  order.Status === "Completed"
                    ? "text-green-600"
                    : order.Status === "Pending"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {order.Status || "Unknown"}
              </span>
            </p>

            <p className="text-gray-600 text-sm mb-4">
              Ordered On:{" "}
              {order.CreatedDate
                ? new Date(order.CreatedDate).toLocaleDateString()
                : "N/A"}
            </p>

            <button
              onClick={() => alert(`Viewing details for Order #${order.OrderID}`)}
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

export default MyIndividualServices;
