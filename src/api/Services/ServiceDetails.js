import axiosInstance from "../axiosInstance";

/**
 * Fetch a single service detail by ID
 * @param {string|number} id - ServiceDetailID
 * @returns {Promise<Object>}
 */
export const getServiceDetailById = async (id) => {
    try {
        const response = await axiosInstance.get(`/service-details/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching service detail:", error);
        throw error;
    }
};

/**
 * Fetch tasks for a service detail
 * @param {Object} params - { serviceId, assignmentId }
 * @returns {Promise<Object>}
 */
export const getTasksByServiceAssignment = async (params) => {
    try {
        const response = await axiosInstance.post("/getTasksByServiceAssignment", params);
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};
