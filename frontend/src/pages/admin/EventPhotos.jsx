import {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import {
    CloudUpload,
    Image as ImageIcon,
    Refresh,
} from "@mui/icons-material";

import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";

import api from "../../services/api";

import {
    getEventPhotos,
    uploadToImageKit,
    saveEventPhoto,
} from "../../services/eventFiles";


// =========================================================
// COMPONENT
// =========================================================

function EventPhotos() {

    // =====================================================
    // EVENTS
    // =====================================================

    const [events, setEvents] =
        useState([]);

    const [selectedEventId, setSelectedEventId] =
        useState("");


    // =====================================================
    // PHOTOS
    // =====================================================

    const [photos, setPhotos] =
        useState([]);

    const [loadingEvents, setLoadingEvents] =
        useState(true);

    const [loadingPhotos, setLoadingPhotos] =
        useState(false);


    // =====================================================
    // UPLOAD
    // =====================================================

    const [selectedFiles, setSelectedFiles] =
        useState([]);

    const [uploading, setUploading] =
        useState(false);


    // =====================================================
    // MESSAGES
    // =====================================================

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =====================================================
    // LOAD EVENTS
    // =====================================================

    const loadEvents = async () => {

        try {

            setLoadingEvents(true);

            setError("");

            const response =
                await api.get("/events");

            const eventData =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setEvents(eventData);

        } catch (error) {

            console.error(
                "Failed to load events:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load events."
            );

        } finally {

            setLoadingEvents(false);

        }
    };


    // =====================================================
    // LOAD PHOTOS
    // =====================================================

    const loadPhotos = async () => {

        if (!selectedEventId) {

            setPhotos([]);

            return;
        }

        try {

            setLoadingPhotos(true);

            setError("");

            const data =
                await getEventPhotos(
                    selectedEventId
                );

            setPhotos(data);

        } catch (error) {

            console.error(
                "Failed to load event photos:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load event photos."
            );

        } finally {

            setLoadingPhotos(false);

        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadEvents();

    }, []);


    // =====================================================
    // LOAD PHOTOS WHEN EVENT CHANGES
    // =====================================================

    useEffect(() => {

        loadPhotos();

    }, [selectedEventId]);


    // =====================================================
    // FILE SELECTION
    // =====================================================

    const handleFileChange = (event) => {

        const files =
            Array.from(
                event.target.files || []
            );

        setSelectedFiles(files);

        setError("");

        setSuccess("");
    };


    // =====================================================
    // UPLOAD PHOTOS
    // =====================================================

    const handleUpload = async () => {

        if (!selectedEventId) {

            setError(
                "Please select an event first."
            );

            return;
        }


        if (selectedFiles.length === 0) {

            setError(
                "Please select at least one image."
            );

            return;
        }


        try {

            setUploading(true);

            setError("");

            setSuccess("");


            let uploadedCount = 0;


            for (const file of selectedFiles) {

                // -------------------------------------------------
                // BASIC IMAGE VALIDATION
                // -------------------------------------------------

                if (!file.type.startsWith("image/")) {

                    throw new Error(
                        `"${file.name}" is not an image.`
                    );
                }


                // -------------------------------------------------
                // SIZE LIMIT
                // -------------------------------------------------

                const maxSize =
                    10 * 1024 * 1024;

                if (file.size > maxSize) {

                    throw new Error(
                        `"${file.name}" is larger than 10 MB.`
                    );
                }


                // -------------------------------------------------
                // UPLOAD TO IMAGEKIT
                // -------------------------------------------------

                const imageData =
                    await uploadToImageKit(
                        file
                    );


                // -------------------------------------------------
                // SAVE METADATA TO BACKEND
                // -------------------------------------------------

                await saveEventPhoto(
                    selectedEventId,
                    imageData
                );


                uploadedCount++;
            }


            setSelectedFiles([]);

            setSuccess(
                `${uploadedCount} photo${
                    uploadedCount === 1
                        ? ""
                        : "s"
                } uploaded successfully.`
            );


            await loadPhotos();


        } catch (error) {

            console.error(
                "Failed to upload event photos:",
                error
            );

            setError(
                error.response?.data?.detail ||
                error.message ||
                "Unable to upload event photos."
            );

        } finally {

            setUploading(false);

        }
    };


    // =====================================================
    // SELECTED EVENT
    // =====================================================

    const selectedEvent =
        events.find(
            (event) =>
                String(event.id) ===
                String(selectedEventId)
        );


    // =====================================================
    // UI
    // =====================================================

    return (
        <AdminDashboardLayout>

            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <Box
                sx={{
                    mb: 4,
                }}
            >

                <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={700}
                    sx={{
                        fontSize: {
                            xs: "1.75rem",
                            sm: "2rem",
                            md: "2.25rem",
                        },
                    }}
                >
                    Event Photos
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        mt: 0.5,
                    }}
                >
                    Upload and manage photos from NSS events.
                </Typography>

            </Box>


            {/* =================================================
                ALERTS
            ================================================== */}

            {error && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>

            )}


            {success && (

                <Alert
                    severity="success"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                    onClose={() =>
                        setSuccess("")
                    }
                >
                    {success}
                </Alert>

            )}


            {/* =================================================
                EVENT SELECTOR
            ================================================== */}

            <Card
                elevation={0}
                sx={{
                    border:
                        "1px solid rgba(75, 22, 76, 0.08)",
                    mb: 3,
                }}
            >

                <CardContent>

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                            mb: 0.5,
                        }}
                    >
                        Select Event
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                        }}
                    >
                        Choose the NSS event whose photos you want to manage.
                    </Typography>


                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                    >

                        <FormControl
                            fullWidth
                            disabled={loadingEvents}
                        >

                            <InputLabel>
                                Event
                            </InputLabel>

                            <Select
                                value={
                                    selectedEventId
                                }
                                label="Event"
                                onChange={(event) =>
                                    setSelectedEventId(
                                        event.target.value
                                    )
                                }
                            >

                                <MenuItem value="">
                                    Select an event
                                </MenuItem>

                                {events.map(
                                    (event) => (

                                        <MenuItem
                                            key={
                                                event.id
                                            }
                                            value={
                                                event.id
                                            }
                                        >
                                            {event.title}
                                        </MenuItem>

                                    )
                                )}

                            </Select>

                        </FormControl>


                        <Button
                            variant="outlined"
                            startIcon={
                                <Refresh />
                            }
                            onClick={
                                loadEvents
                            }
                            disabled={
                                loadingEvents ||
                                uploading
                            }
                            sx={{
                                minWidth: {
                                    xs: "100%",
                                    sm: 120,
                                },
                                minHeight: 56,
                            }}
                        >
                            Refresh
                        </Button>

                    </Stack>

                </CardContent>

            </Card>


            {/* =================================================
                UPLOAD AREA
            ================================================== */}

            {selectedEventId && (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                        mb: 3,
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Upload Photos
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                                mb: 2,
                            }}
                        >
                            Photos will be attached to{" "}
                            <strong>
                                {selectedEvent?.title ||
                                    "this event"}
                            </strong>
                            .
                        </Typography>


                        <Box
                            sx={{
                                border:
                                    "2px dashed rgba(75, 22, 76, 0.18)",
                                borderRadius: 3,
                                p: {
                                    xs: 3,
                                    sm: 5,
                                },
                                textAlign: "center",
                            }}
                        >

                            <CloudUpload
                                sx={{
                                    fontSize: 48,
                                    color:
                                        "primary.main",
                                    mb: 1,
                                }}
                            />


                            <Typography
                                variant="body1"
                                fontWeight={600}
                            >
                                Choose event photos
                            </Typography>


                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    mb: 2,
                                }}
                            >
                                JPG, PNG, WEBP — up to 10 MB each
                            </Typography>


                            <Button
                                component="label"
                                variant="outlined"
                                disabled={uploading}
                            >
                                Choose Photos

                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={
                                        handleFileChange
                                    }
                                />

                            </Button>


                            {selectedFiles.length > 0 && (

                                <Box
                                    sx={{
                                        mt: 2,
                                    }}
                                >

                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {
                                            selectedFiles.length
                                        }{" "}
                                        photo
                                        {
                                            selectedFiles.length ===
                                            1
                                                ? ""
                                                : "s"
                                        }{" "}
                                        selected
                                    </Typography>


                                    <Stack
                                        spacing={0.5}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >

                                        {selectedFiles.map(
                                            (file) => (

                                                <Typography
                                                    key={
                                                        file.name +
                                                        file.lastModified
                                                    }
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {file.name}
                                                </Typography>

                                            )
                                        )}

                                    </Stack>

                                </Box>

                            )}


                            <Button
                                variant="contained"
                                startIcon={
                                    uploading ? (
                                        <CircularProgress
                                            size={18}
                                            color="inherit"
                                        />
                                    ) : (
                                        <CloudUpload />
                                    )
                                }
                                onClick={
                                    handleUpload
                                }
                                disabled={
                                    uploading ||
                                    selectedFiles.length ===
                                        0
                                }
                                sx={{
                                    mt: 2,
                                }}
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Upload Photos"}
                            </Button>

                        </Box>

                    </CardContent>

                </Card>

            )}


            {/* =================================================
                PHOTO GALLERY
            ================================================== */}

            {selectedEventId && (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >

                            <Box>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Event Gallery
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.25,
                                    }}
                                >
                                    Photos uploaded for this event.
                                </Typography>

                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {photos.length}{" "}
                                photo
                                {photos.length === 1
                                    ? ""
                                    : "s"}
                            </Typography>

                        </Box>


                        <Divider
                            sx={{
                                my: 2,
                            }}
                        />


                        {loadingPhotos ? (

                            <Box
                                sx={{
                                    minHeight: 220,
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                }}
                            >

                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                >

                                    <CircularProgress />

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Loading photos...
                                    </Typography>

                                </Stack>

                            </Box>

                        ) : photos.length === 0 ? (

                            <Box
                                sx={{
                                    minHeight: 220,
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    textAlign: "center",
                                    px: 2,
                                }}
                            >

                                <ImageIcon
                                    sx={{
                                        fontSize: 54,
                                        color:
                                            "text.secondary",
                                        mb: 1,
                                    }}
                                />

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    No photos yet
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.5,
                                    }}
                                >
                                    Upload photos above to build this event's gallery.
                                </Typography>

                            </Box>

                        ) : (

                            <Grid
                                container
                                spacing={2}
                            >

                                {photos.map(
                                    (photo) => (

                                        <Grid
                                            key={
                                                photo.id ||
                                                photo.imagekit_file_id
                                            }
                                            size={{
                                                xs: 12,
                                                sm: 6,
                                                md: 4,
                                                lg: 3,
                                            }}
                                        >

                                            <Card
                                                elevation={0}
                                                sx={{
                                                    overflow:
                                                        "hidden",
                                                    border:
                                                        "1px solid rgba(75, 22, 76, 0.08)",
                                                    height:
                                                        "100%",
                                                }}
                                            >

                                                <Box
                                                    component="img"
                                                    src={
                                                        photo.file_url
                                                    }
                                                    alt={
                                                        photo.file_name ||
                                                        "Event photo"
                                                    }
                                                    sx={{
                                                        width:
                                                            "100%",
                                                        aspectRatio:
                                                            "4 / 3",
                                                        objectFit:
                                                            "cover",
                                                        display:
                                                            "block",
                                                        backgroundColor:
                                                            "#f5f5f5",
                                                    }}
                                                />

                                                <CardContent
                                                    sx={{
                                                        py: 1.5,
                                                    }}
                                                >

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display:
                                                                "block",
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {
                                                            photo.file_name ||
                                                            "Event photo"
                                                        }
                                                    </Typography>

                                                </CardContent>

                                            </Card>

                                        </Grid>

                                    )
                                )}

                            </Grid>

                        )}

                    </CardContent>

                </Card>

            )}

        </AdminDashboardLayout>
    );
}


export default EventPhotos;