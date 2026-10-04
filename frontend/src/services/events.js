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
    const response = await api.get(
        `/events/${eventId}`
    );

    return response.data;
}


// =========================================================
// CREATE EVENT
// STAFF ONLY
// =========================================================

export async function createEvent(eventData) {
    const response = await api.post(
        "/events",
        eventData
    );

    return response.data;
}


// =========================================================
// UPDATE EVENT
// STAFF ONLY
// =========================================================

export async function updateEvent(eventId, eventData) {
    const response = await api.patch(
        `/events/${eventId}`,
        eventData
    );

    return response.data;
}


// =========================================================
// DELETE EVENT
// STAFF ONLY
// =========================================================

export async function deleteEvent(eventId) {
    const response = await api.delete(
        `/events/${eventId}`
    );

    return response.data;
}


// =========================================================
// GET EVENT TEMPLATES
// STAFF ONLY
// =========================================================

export async function getEventTemplates() {
    const response = await api.get(
        "/events/templates"
    );

    return response.data;
}


// =========================================================
// CREATE EVENT TEMPLATE
// STAFF ONLY
// =========================================================

export async function createEventTemplate(templateData) {
    const response = await api.post(
        "/events/templates",
        templateData
    );

    return response.data;
}


// =========================================================
// UPDATE EVENT TEMPLATE
// STAFF ONLY
// =========================================================

export async function updateEventTemplate(
    templateId,
    templateData
) {
    const response = await api.patch(
        `/events/templates/${templateId}`,
        templateData
    );

    return response.data;
}


// =========================================================
// PUBLISH EVENT
// STAFF ONLY
// =========================================================

export async function publishEvent(eventId) {
    const response = await api.post(
        `/events/${eventId}/publish`
    );

    return response.data;
}


// =========================================================
// START EVENT
// STAFF ONLY
// =========================================================

export async function startEvent(eventId) {
    const response = await api.post(
        `/events/${eventId}/start`
    );

    return response.data;
}


// =========================================================
// COMPLETE EVENT
// STAFF ONLY
// =========================================================

export async function completeEvent(eventId) {
    const response = await api.post(
        `/events/${eventId}/complete`
    );

    return response.data;
}


// =========================================================
// CANCEL EVENT
// STAFF ONLY
// =========================================================

export async function cancelEvent(eventId) {
    const response = await api.post(
        `/events/${eventId}/cancel`
    );

    return response.data;
}


// =========================================================
// REGISTER FOR EVENT
// VOLUNTEER
// =========================================================

export async function registerForEvent(eventId) {
    const response = await api.post(
        `/events/${eventId}/register`
    );

    return response.data;
}


// =========================================================
// CANCEL MY REGISTRATION
// VOLUNTEER
// =========================================================

export async function cancelRegistration(eventId) {
    const response = await api.delete(
        `/events/${eventId}/register`
    );

    return response.data;
}


// =========================================================
// GET MY REGISTRATION
// VOLUNTEER
// =========================================================

export async function getMyRegistration(eventId) {
    const response = await api.get(
        `/events/${eventId}/my-registration`
    );

    return response.data;
}


// =========================================================
// GET MY ATTENDANCE
// VOLUNTEER
// =========================================================

export async function getMyAttendance(eventId) {
    const response = await api.get(
        `/events/${eventId}/attendance/me`
    );

    return response.data;
}


// =========================================================
// GET EVENT REGISTRATIONS
// STAFF ONLY
// =========================================================

export async function getEventRegistrations(eventId) {
    const response = await api.get(
        `/events/${eventId}/registrations`
    );

    return response.data;
}


// =========================================================
// GET EVENT ATTENDANCE
// STAFF ONLY
// =========================================================

export async function getEventAttendance(eventId) {
    const response = await api.get(
        `/events/${eventId}/attendance`
    );

    return response.data;
}


// =========================================================
// MARK / UPDATE ATTENDANCE
// STAFF ONLY
// =========================================================

export async function markAttendance(
    eventId,
    userId,
    attendanceStatus
) {
    const response = await api.post(
        `/events/${eventId}/attendance`,
        {
            user_id: userId,
            status: attendanceStatus,
        }
    );

    return response.data;
}