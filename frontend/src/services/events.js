import api from "./api";

    // =========================================================
    // GET ALL EVENTS
    // =========================================================

    export async function getEvents() {
    const response = await api.get("/events");
    return response.data;
    }

    // =========================================================
    // GET SINGLE EVENT
    // =========================================================

    export async function getEvent(eventId) {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
    }

    // =========================================================
    // REGISTER FOR EVENT
    // =========================================================

    export async function registerForEvent(eventId) {
    const response = await api.post(
        `/events/${eventId}/register`
    );

    return response.data;
    }

    // =========================================================
    // CANCEL MY REGISTRATION
    // =========================================================

    export async function cancelRegistration(eventId) {
    const response = await api.delete(
        `/events/${eventId}/register`
    );

    return response.data;
    }

    // =========================================================
    // GET MY REGISTRATION
    // =========================================================

    export async function getMyRegistration(eventId) {
    const response = await api.get(
        `/events/${eventId}/my-registration`
    );

    return response.data;
    }

    // =========================================================
    // GET MY ATTENDANCE
    // =========================================================

    export async function getMyAttendance(eventId) {
    const response = await api.get(
        `/events/${eventId}/attendance/me`
    );

    return response.data;
}