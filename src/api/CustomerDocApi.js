import axiosInstance from "./axiosInstance";
import { setSecureItem, getSecureItem } from "../utils/secureStorage";

// Helper function to safely get user data (same as in React component)
const getUserData = () => {
  try {
    const userStr = getSecureItem("user" || "partnerUser");
    
    // If userStr is already an object, return it directly
    if (typeof userStr === 'object' && userStr !== null) {
      return userStr;
    }
    
    // If it's a string, try to parse it
    if (typeof userStr === 'string') {
      // Clean the string if it contains :NULL
      const cleanStr = userStr.replace(/:NULL/g, ':null');
      return JSON.parse(cleanStr);
    }
    
    // Return empty object if nothing works
    return {};
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {};
  }
};

/**
 * Upload a customer document
 * @param {string} type - 'PAN' | 'ADHAAR' | 'PassportPhoto'
 * @param {File} file - File object
 */
const uploadDocument = async (type, file) => {
  const userObj = getUserData();
  const customerId = userObj.CustomerID;
  
  if (!customerId) throw new Error('Customer ID not found');
  
  const formData = new FormData();
  formData.append("customerId", customerId);

  // Map type to correct API field
  if (type === "PAN") formData.append("PAN", file);
  if (type === "ADHAAR") formData.append("ADHAAR", file);
  if (type === "PassportPhoto") formData.append("PassportPhoto", file);

  try {
    const response = await axiosInstance.post("/customer-documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

/**
 * Get all documents (Base64) for the current customer
 */
const getAllDocuments = async () => {
  const userObj = getUserData();
  const customerId = userObj.CustomerID;
  
  if (!customerId) throw new Error('Customer ID not found');
  
  try {
    const response = await axiosInstance.get(`/customer-documents/${customerId}`);
    // If API returns {success: false, message: 'Documents not found'}, treat as no docs
    if (response.data && response.data.success === false && response.data.message && response.data.message.toLowerCase().includes('not found')) {
      return {};
    }
    console.log('API Response:', response.data);
    
    return response.data;
  } catch (error) {
    // If error response is 'Documents not found', treat as no docs
    if (error.response && error.response.data && error.response.data.message && error.response.data.message.toLowerCase().includes('not found')) {
      return {};
    }
    console.error("Error fetching documents:", error);
    throw error;
  }
};

/**
 * Get individual document (URL to view or download) for the current customer
 */
const getDocumentUrl = (docType, download = false) => {
  const userObj = getUserData();
  const customerId = userObj.CustomerID;
  
  if (!customerId) throw new Error('Customer ID not found');
  
  let url = `/customer-documents/${customerId}/${docType}`;
  if (download) url += "?download=1";
  return url;
};

export default {
  uploadDocument,
  getAllDocuments,
  getDocumentUrl,
};