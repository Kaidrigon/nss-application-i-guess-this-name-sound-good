import api from "./api";


// =========================================================
// GET EVENT REPORT
// =========================================================

export const getEventReport = async (eventId) => {

    const response = await api.get(
        `/reports/event/${eventId}`
    );

    return response.data;
};


// =========================================================
// EXPORT EVENT REPORT TO EXCEL
// =========================================================

export const exportEventReport = async (eventId) => {

    const response = await api.get(
        `/reports/event/${eventId}/excel`,
        {
            responseType: "blob",
        }
    );

    return response.data;
};