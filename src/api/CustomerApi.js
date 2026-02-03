import axios from "axios";
import axiosInstance from "./axiosInstance";
//
export const assignCustomer = async ({ language, state, district }) => {
  const res = await axiosInstance.post("/assignCustomer", {
    language,
    state,
    district,
  });
  return res.data;
};

// Custom axios instance for createCustomer
const customerAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api", // adjust as needed
  headers: {
    "x-origin": "website",
  },
});

// Customer APIs
export const createCustomer = (payload) =>
  customerAxios.post("/customer", payload);

export const getCustomers = () => axiosInstance.get("/customer");

export const getCustomerById = (id, employeeId) =>
  axiosInstance.post("/customer/get", { CustomerID: id, EmployeeID: employeeId });

export const deleteCustomer = (id) =>
  axiosInstance.delete(`/customer/${id}`);