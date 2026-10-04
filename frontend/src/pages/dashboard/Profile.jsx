import { useEffect, useRef, useState } from "react";
import api from "../../services/api";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [serviceHours, setServiceHours] = useState(null);
    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(true);

    const [uploading, setUploading] = useState(false);
    const [uploadType, setUploadType] = useState("");

    const [error, setError] = useState("");
    const [uploadMessage, setUploadMessage] = useState("");

    // ---------------------------------------------------------
    // CHANGE PASSWORD STATE
    // ---------------------------------------------------------

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const certificateInputRef = useRef(null);
    const documentInputRef = useRef(null);

    // ---------------------------------------------------------
    // LOAD PROFILE + SERVICE HOURS
    // ---------------------------------------------------------

    const loadProfile = async () => {
        try {
        setLoading(true);
        setError("");

        const [profileResponse, serviceHoursResponse] =
            await Promise.all([
            api.get("/auth/me"),
            api.get("/service-hours/me"),
            ]);

        setProfile(profileResponse.data);
        setServiceHours(serviceHoursResponse.data);
        } catch (err) {
        console.error(err);

        setError(
            err.response?.data?.detail ||
            "Unable to load profile information."
        );
        } finally {
        setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // LOAD MY FILES
    // ---------------------------------------------------------

    const loadFiles = async () => {
        try {
        setFilesLoading(true);

        const response = await api.get("/files/my");

        setFiles(response.data.files || []);
        } catch (err) {
        console.error(err);

        setError(
            err.response?.data?.detail ||
            "Unable to load your documents."
        );
        } finally {
        setFilesLoading(false);
        }
    };

    // ---------------------------------------------------------
    // INITIAL LOAD
    // ---------------------------------------------------------

    useEffect(() => {
        loadProfile();
        loadFiles();
    }, []);

    // ---------------------------------------------------------
    // OPEN CERTIFICATE PICKER
    // ---------------------------------------------------------

    const openCertificatePicker = () => {
        setUploadMessage("");
        setError("");

        certificateInputRef.current?.click();
    };

    // ---------------------------------------------------------
    // OPEN DOCUMENT PICKER
    // ---------------------------------------------------------

    const openDocumentPicker = () => {
        setUploadMessage("");
        setError("");

        documentInputRef.current?.click();
    };

    // ---------------------------------------------------------
    // HANDLE FILE SELECTION
    // ---------------------------------------------------------

    const handleFileSelected = async (
        event,
        fileType
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
        return;
        }

        event.target.value = "";

        setError("");
        setUploadMessage("");

        // -------------------------------------------------------
        // FILE SIZE LIMIT
        // -------------------------------------------------------

        const maxFileSize = 10 * 1024 * 1024;

        if (file.size > maxFileSize) {
        setError(
            "File is too large. Maximum file size is 10 MB."
        );

        return;
        }

        // -------------------------------------------------------
        // FILE TYPE VALIDATION
        // -------------------------------------------------------

        const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
        setError(
            "Only JPG, PNG, WEBP images and PDF files are allowed."
        );

        return;
        }

        try {
        setUploading(true);
        setUploadType(fileType);

        // -----------------------------------------------------
        // GET IMAGEKIT AUTHENTICATION
        // -----------------------------------------------------

        const authResponse = await api.get(
            "/imagekit/auth"
        );

        const {
            token,
            expire,
            signature,
            publicKey,
        } = authResponse.data;

        // -----------------------------------------------------
        // CREATE IMAGEKIT FORM DATA
        // -----------------------------------------------------

        const formData = new FormData();

        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("publicKey", publicKey);
        formData.append("signature", signature);
        formData.append("expire", expire);
        formData.append("token", token);

        // -----------------------------------------------------
        // UPLOAD TO IMAGEKIT
        // -----------------------------------------------------

        const imageKitResponse = await fetch(
            "https://upload.imagekit.io/api/v1/files/upload",
            {
            method: "POST",
            body: formData,
            }
        );

        const imageKitData =
            await imageKitResponse.json();

        if (!imageKitResponse.ok) {
            throw new Error(
            imageKitData.message ||
                "Image upload failed."
            );
        }

        // -----------------------------------------------------
        // SAVE METADATA IN OUR BACKEND
        // -----------------------------------------------------

        await api.post("/files/my", {
            file_type: fileType,
            file_url: imageKitData.url,
            imagekit_file_id: imageKitData.fileId,
            file_name: file.name,
        });

        // -----------------------------------------------------
        // REFRESH FILE LIST
        // -----------------------------------------------------

        await loadFiles();

        setUploadMessage(
            fileType === "certificate"
            ? "Certificate uploaded successfully."
            : "Document uploaded successfully."
        );
        } catch (err) {
        console.error(err);

        setError(
            err.response?.data?.detail ||
            err.message ||
            "File upload failed."
        );
        } finally {
        setUploading(false);
        setUploadType("");
        }
    };

    // ---------------------------------------------------------
    // CHANGE PASSWORD
    // ---------------------------------------------------------

    const handleChangePassword = async (event) => {
        event.preventDefault();

        setPasswordError("");
        setPasswordMessage("");

        // -------------------------------------------------------
        // CHECK CONFIRM PASSWORD
        // -------------------------------------------------------

        if (newPassword !== confirmPassword) {
        setPasswordError(
            "New password and confirm password do not match."
        );

        return;
        }

        // -------------------------------------------------------
        // CHECK EMPTY FIELDS
        // -------------------------------------------------------

        if (!currentPassword || !newPassword) {
        setPasswordError(
            "Please fill in all password fields."
        );

        return;
        }

        try {
        setChangingPassword(true);

        await api.post(
            "/auth/change-password",
            {
            current_password: currentPassword,
            new_password: newPassword,
            }
        );

        setPasswordMessage(
            "Password changed successfully."
        );

        // Clear form after successful change
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        } catch (err) {
        console.error(err);

        setPasswordError(
            err.response?.data?.detail ||
            "Unable to change password."
        );
        } finally {
        setChangingPassword(false);
        }
    };

    // ---------------------------------------------------------
    // LOADING
    // ---------------------------------------------------------

    if (loading) {
        return (
        <div>
            <h2>Profile</h2>
            <p>Loading profile...</p>
        </div>
        );
    }

    // ---------------------------------------------------------
    // ERROR
    // ---------------------------------------------------------

    if (error && !profile) {
        return (
        <div>
            <h2>Profile</h2>
            <p>{error}</p>
        </div>
        );
    }

    // ---------------------------------------------------------
    // PROFILE
    // ---------------------------------------------------------

    return (
        <div>
        <h1>My Profile</h1>

        {error && (
            <p>
            {error}
            </p>
        )}

        {uploadMessage && (
            <p>
            {uploadMessage}
            </p>
        )}

        {/* =====================================================
            PERSONAL INFORMATION
            ===================================================== */}

        <section>
            <h2>Personal Information</h2>

            <div>
            <strong>Name</strong>
            <p>{profile?.name || "Not available"}</p>
            </div>

            <div>
            <strong>Roll Number</strong>
            <p>
                {profile?.roll_number || "Not provided"}
            </p>
            </div>

            <div>
            <strong>Email</strong>
            <p>
                {profile?.email || "Not provided"}
            </p>
            </div>

            <div>
            <strong>Class</strong>
            <p>
                {profile?.class_name || "Not available"}
            </p>
            </div>

            <div>
            <strong>Year</strong>
            <p>
                {profile?.year || "Not available"}
            </p>
            </div>

            <div>
            <strong>Role</strong>
            <p>
                {profile?.role || "volunteer"}
            </p>
            </div>
        </section>

        {/* =====================================================
            SERVICE HOURS
            ===================================================== */}

        <section>
            <h2>Service Hours</h2>

            <p>
            <strong>
                {serviceHours?.service_hours || 0}
            </strong>{" "}
            / {serviceHours?.required_hours || 240} hours
            </p>

            <p>
            Remaining:{" "}
            {serviceHours?.remaining_hours || 0} hours
            </p>

            <p>
            Completion:{" "}
            {serviceHours?.completion_percentage || 0}%
            </p>
        </section>

        {/* =====================================================
            MY DOCUMENTS
            ===================================================== */}

        <section>
            <h2>My Documents</h2>

            {/* Hidden certificate input */}
            <input
            ref={certificateInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            style={{ display: "none" }}
            onChange={(event) =>
                handleFileSelected(
                event,
                "certificate"
                )
            }
            />

            {/* Hidden document input */}
            <input
            ref={documentInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            style={{ display: "none" }}
            onChange={(event) =>
                handleFileSelected(
                event,
                "document"
                )
            }
            />

            <button
            type="button"
            onClick={openCertificatePicker}
            disabled={uploading}
            >
            {uploading &&
            uploadType === "certificate"
                ? "Uploading..."
                : "Upload Certificate"}
            </button>

            <button
            type="button"
            onClick={openDocumentPicker}
            disabled={uploading}
            >
            {uploading &&
            uploadType === "document"
                ? "Uploading..."
                : "Upload Document"}
            </button>

            <p>
            JPG, PNG, WEBP or PDF. Maximum size: 10 MB.
            </p>

            {filesLoading ? (
            <p>Loading documents...</p>
            ) : files.length === 0 ? (
            <p>
                You have not uploaded any documents yet.
            </p>
            ) : (
            <div>
                {files.map((file) => (
                <div key={file.id}>
                    <p>
                    <strong>
                        {file.file_name}
                    </strong>
                    </p>

                    <p>
                    Type: {file.file_type}
                    </p>

                    <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    >
                    View File
                    </a>
                </div>
                ))}
            </div>
            )}
        </section>

        {/* =====================================================
            CHANGE PASSWORD
            ===================================================== */}

        <section>
            <h2>Change Password</h2>

            <p>
            Update your account password.
            </p>

            <form onSubmit={handleChangePassword}>

            {/* Current password */}
            <div>
                <label>
                Current Password
                </label>

                <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                    setCurrentPassword(
                    event.target.value
                    )
                }
                placeholder="Enter current password"
                autoComplete="current-password"
                />
            </div>

            {/* New password */}
            <div>
                <label>
                New Password
                </label>

                <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                    setNewPassword(
                    event.target.value
                    )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                />
            </div>

            {/* Confirm password */}
            <div>
                <label>
                Confirm New Password
                </label>

                <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                    setConfirmPassword(
                    event.target.value
                    )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                />
            </div>

            {/* Password requirements */}
            <p>
                Password must be at least 8 characters and
                contain an uppercase letter, lowercase letter,
                number, and special character.
            </p>

            {/* Password error */}
            {passwordError && (
                <p>
                {passwordError}
                </p>
            )}

            {/* Password success */}
            {passwordMessage && (
                <p>
                {passwordMessage}
                </p>
            )}

            <button
                type="submit"
                disabled={changingPassword}
            >
                {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>

            </form>
        </section>
        </div>
    );
    }

    export default Profile;