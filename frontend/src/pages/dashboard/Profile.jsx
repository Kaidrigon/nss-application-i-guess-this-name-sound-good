import { useEffect, useState } from "react";
import api from "../../services/api";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [serviceHours, setServiceHours] = useState(null);
    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(true);
    const [error, setError] = useState("");

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
        </div>
    );
    }

    export default Profile;