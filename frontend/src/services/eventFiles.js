import api from "./api";

// =========================================================
// GET EVENT PHOTOS
// =========================================================

export const getEventPhotos = async (eventId) => {
    const response = await api.get(
        `/files/event/${eventId}`
    );

    return Array.isArray(response.data)
        ? response.data
        : [];
};


// =========================================================
// GET IMAGEKIT AUTHENTICATION
// =========================================================

export const getImageKitAuth = async () => {
    const response = await api.get(
        "/imagekit/auth"
    );

    return response.data;
};


// =========================================================
// UPLOAD FILE DIRECTLY TO IMAGEKIT
// =========================================================

export const uploadToImageKit = async (file) => {

    const auth = await getImageKitAuth();

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "fileName",
        file.name
    );

    formData.append(
        "publicKey",
        auth.publicKey
    );

    formData.append(
        "signature",
        auth.signature
    );

    formData.append(
        "expire",
        auth.expire
    );

    formData.append(
        "token",
        auth.token
    );

    formData.append(
        "folder",
        "/nss/events"
    );

    const response = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {

        let message =
            "Image upload failed.";

        try {

            const data =
                await response.json();

            message =
                data.message ||
                data.help ||
                message;

        } catch {
            // Ignore JSON parsing errors.
        }

        throw new Error(message);
    }

    return response.json();
};


// =========================================================
// SAVE EVENT PHOTO METADATA TO BACKEND
// =========================================================

export const saveEventPhoto = async (
    eventId,
    imageData
) => {

    const response = await api.post(
        `/files/event/${eventId}`,
        {
            file_type: "event_photo",

            file_url:
                imageData.url,

            imagekit_file_id:
                imageData.fileId,

            file_name:
                imageData.name,
        }
    );

    return response.data;
};