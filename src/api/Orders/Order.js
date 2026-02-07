import axiosInstance from "../axiosInstance";
import { getSecureItem } from "../../utils/secureStorage";

// Helper: always get latest selectedCompany.CompanyID from secure storage
const getCompanyIdFromStorage = () => {
  try {
    // Always check both localStorage and sessionStorage for latest value
    let raw = getSecureItem("selectedCompany");
    if (!raw) {
      raw = window.localStorage.getItem("selectedCompany") || window.sessionStorage.getItem("selectedCompany");
    }
    if (raw) {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed && parsed.CompanyID) return parsed.CompanyID;
    }
    // Fallback: try from user object
    let userDataRaw = getSecureItem("user" || "partnerUser");
    if (!userDataRaw) {
      userDataRaw = window.localStorage.getItem("user" || "partnerUser" ) || window.sessionStorage.getItem("user" || "partnerUser");
    }
    const userData = userDataRaw && typeof userDataRaw === "string" ? JSON.parse(userDataRaw) : userDataRaw;
    if (userData && userData.Companies && userData.Companies.length > 0) {
      return userData.Companies[0].CompanyID;
    }
    return null;
  } catch (error) {
    console.error("Error getting company ID:", error);
    return null;
  }
};

// 🔹 Fetch all orders for logged-in company
export const getAllOrdersByCompany = async (filters = {}) => {
  const companyId = getCompanyIdFromStorage();
  if (!companyId) throw new Error("Company not selected");

  // Use POST request and send filters in body (matches backend)
  const response = await axiosInstance.post(`/order/company/${companyId}`, {
    ...filters,
    limit: filters.limit || 10,
    page: filters.page || 1,
  });

  return response.data;
};

// 🔹 Fetch individual orders only
export const getIndividualOrders = async (filters = {}) => {
  return getAllOrdersByCompany({
    ...filters,
    IsIndividual: true,
  });
};

// 🔹 Fetch package orders only
export const getPackageOrders = async (filters = {}) => {
  return getAllOrdersByCompany({
    ...filters,
    IsIndividual: false,
  });
};

// Set selected company
export const setSelectedCompany = (company) => {
  if (!company || !company.CompanyID) {
    console.warn("Invalid company object provided");
    return;
  }
  setSecureItem(
    "selectedCompany",
    JSON.stringify({
      CompanyID: company.CompanyID,
      CompanyName: company.BusinessName || company.CompanyName || "",
    })
  );
  setSecureItem("CompanyId", company.CompanyID.toString());
  setShowCompanyDropdown(false);
  // Dispatch a custom event so order pages can reload
  window.dispatchEvent(new Event("company-switched"));
};
