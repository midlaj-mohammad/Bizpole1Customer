import axiosInstance from "./axiosInstance";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

/**
 * 🔹 Add or Update Company
 * Stores CompanyID securely after successful upsert.
 */
export const upsertCompany = async (companyData) => {
  try {
    const response = await axiosInstance.post("/company/upsert", companyData);
    console.log("Upsert company response:", response.data);

    // ✅ Extract CompanyID from response (based on your actual response format)
    const companyId =
      response.data?.CompanyID || // Direct property
      response.data?.companyID || // camelCase variant
      response.data?.companyId || // mixed case
      response.data?.data?.CompanyID || // Nested in data object
      response.data?.data?.companyID;

    if (companyId) {
      // 🔐 Store it permanently in secure storage
      setSecureItem("CompanyId", companyId.toString());
      console.log("✅ CompanyId saved to secure storage:", companyId);
    } else {
      console.warn("⚠️ No CompanyId found in upsertCompany response. Response:", response.data);
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error in upsertCompany:", error);
    throw error;
  }
};

/**
 * 🔹 Get Company Details
 */
export const getCompanyById = async (id) => {
  try {
    const companyId = id || getSecureItem("CompanyId"); 
    console.log("Using CompanyId for getCompanyById:", companyId);

    if (!companyId) throw new Error("CompanyId not found");

    const response = await axiosInstance.post("/company/get-details", {
      CompanyId: companyId,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error in getCompanyById:", error);
    throw error;
  }
};

/**
 * 🔹 Get Company Details by ID
 * Example payload:
 * {
 *   "CompanyId": 613
 * }
 */
export const getCompanyDetails = async (companyId) => {
  try {
    if (!companyId) {
      throw new Error("CompanyId is required to fetch company details");
    }

    const response = await axiosInstance.post("/company/get-details", {
      CompanyId: companyId,
    });

    console.log("✅ Response from getCompanyDetails:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error in getCompanyDetails:", error);
    throw error;
  }
};

/**
 * 🔹 Add or Update Registration & Compliance Status
 */
export const upsertRegistrationStatus = async (registrationStatusData) => {
  try {
    // 🧠 First try to get from secure storage
    let CompanyID = getSecureItem("CompanyId");

    // 🧾 Backup: if not found, try from localStorage directly
    if (!CompanyID) {
      CompanyID = localStorage.getItem("CompanyId");
      console.warn("⚠️ Fallback: Retrieved CompanyId from localStorage:", CompanyID);
    }

    console.log("✅ Using CompanyID for registration status:", CompanyID);

    if (!CompanyID) throw new Error("CompanyId not found in secure storage or localStorage");

    const payload = {
      CompanyID,
      registrationStatus: registrationStatusData,
    };

    console.log("📤 Payload for upsertRegistrationStatus:", payload);

    const response = await axiosInstance.post(
      "/company/upsertRegistrationStatus",
      payload
    );

    console.log("✅ Response from upsertRegistrationStatus:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error in upsertRegistrationStatus:", error);
    throw error;
  }
};