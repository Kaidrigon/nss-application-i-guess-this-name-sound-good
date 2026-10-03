import api from "./api";

// ---------------------------------------------------------
// GET MY SERVICE HOURS
// ---------------------------------------------------------

export const getMyServiceHours = async () => {
const response = await api.get("/service-hours/me");

return response.data;
};

// ---------------------------------------------------------
// GET MY SERVICE-HOUR HISTORY
// ---------------------------------------------------------

export const getMyServiceHourHistory = async () => {
const response = await api.get("/service-hours/me/history");

return response.data;
};
