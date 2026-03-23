import axios from "../../api/axiosInstance";

// Fetch company compliances by company_id
export const getCompanyCompliances = async (company_id) => {
	try {
		const response = await axios.post("/company-compliances/by-company", { company_id });
		return response.data.data || [];
	} catch (error) {
		console.error("Error fetching company compliances:", error);
		return [];
	}
};
