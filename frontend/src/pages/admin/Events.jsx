import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    Add,
    Cancel,
    Delete,
    Edit,
    Event as EventIcon,
    PlayArrow,
    Publish,
    Refresh,
    Search,
    CheckCircle,
    Schedule,
} from "@mui/icons-material";

import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";

import api from "../../services/api";


// =========================================================
// EVENT TYPES
// =========================================================

const EVENT_TYPES = [
    {
        value: "cleanliness",
        label: "Cleanliness",
    },
    {
        value: "blood_donation",
        label: "Blood Donation",
    },
    {
        value: "plantation",
        label: "Plantation",
    },
    {
        value: "health_camp",
        label: "Health Camp",
    },
    {
        value: "awareness",
        label: "Awareness",
    },
    {
        value: "education",
        label: "Education",
    },
    {
        value: "other",
        label: "Other",
    },
];


// =========================================================
// STATUS CONFIG
// =========================================================

const STATUS_CONFIG = {
    draft: {
        label: "Draft",
    },

    published: {
        label: "Published",
    },

    ongoing: {
        label: "Ongoing",
    },

    completed: {
        label: "Completed",
    },

    cancelled: {
        label: "Cancelled",
    },
};


// =========================================================
// HELPERS
// =========================================================

const getEventTypeLabel = (type) => {
    const found = EVENT_TYPES.find(
        (item) => item.value === type
    );

    return found?.label || type || "Other";
};


const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};


const getStatusChip = (status) => {
    const config =
        STATUS_CONFIG[status] || {
            label: status || "Unknown",
        };

    return (
        <Chip
            label={config.label}
            size="small"
            variant="outlined"
        />
    );
};


// =========================================================
// INITIAL EVENT FORM
// =========================================================

const emptyEventForm = {
    template_id: "",
    title: "",
    description: "",
    event_type: "",
    date: "",
    start_time: "",
    end_time: "",
    venue: "",
    credited_hours: "",
    max_volunteers: "",
};


// =========================================================
// INITIAL TEMPLATE FORM
// =========================================================

const emptyTemplateForm = {
    title: "",
    description: "",
    event_type: "",
    default_hours: "",
    default_capacity: "",
    default_venue: "",
};


// =========================================================
// COMPONENT
// =========================================================

function Events() {

    // =====================================================
    // DATA STATE
    // =====================================================

    const [events, setEvents] = useState([]);

    const [templates, setTemplates] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // =====================================================
    // FILTER STATE
    // =====================================================

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");


    // =====================================================
    // EVENT DIALOG
    // =====================================================

    const [eventDialogOpen, setEventDialogOpen] =
        useState(false);

    const [editingEvent, setEditingEvent] =
        useState(null);

    const [eventForm, setEventForm] =
        useState(emptyEventForm);

    const [savingEvent, setSavingEvent] =
        useState(false);


    // =====================================================
    // TEMPLATE DIALOG
    // =====================================================

    const [templateDialogOpen, setTemplateDialogOpen] =
        useState(false);

    const [templateForm, setTemplateForm] =
        useState(emptyTemplateForm);

    const [savingTemplate, setSavingTemplate] =
        useState(false);


    // =====================================================
    // CONFIRMATION DIALOG
    // =====================================================

    const [confirmDialogOpen, setConfirmDialogOpen] =
        useState(false);

    const [confirmAction, setConfirmAction] =
        useState(null);

    const [processingAction, setProcessingAction] =
        useState(false);


    // =====================================================
    // LOAD EVENTS
    // =====================================================

    const loadEvents = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get("/events");

            setEvents(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

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

            setLoading(false);

        }
    };


    // =====================================================
    // LOAD TEMPLATES
    // =====================================================

    const loadTemplates = async () => {

        try {

            const response =
                await api.get("/events/templates");

            setTemplates(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load event templates:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load event templates."
            );
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            await Promise.all([
                loadEvents(),
                loadTemplates(),
            ]);

        };

        loadData();

    }, []);


    // =====================================================
    // FILTERED EVENTS
    // =====================================================

    const filteredEvents = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        return events.filter((event) => {

            const matchesSearch =
                !searchValue ||
                event.title
                    ?.toLowerCase()
                    .includes(searchValue) ||
                event.venue
                    ?.toLowerCase()
                    .includes(searchValue) ||
                event.description
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                event.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    }, [
        events,
        search,
        statusFilter,
    ]);


    // =====================================================
    // EVENT FORM CHANGE
    // =====================================================

    const handleEventFormChange = (
        field,
        value
    ) => {

        setEventForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };


    // =====================================================
    // TEMPLATE FORM CHANGE
    // =====================================================

    const handleTemplateFormChange = (
        field,
        value
    ) => {

        setTemplateForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };


    // =====================================================
    // OPEN CREATE EVENT
    // =====================================================

    const openCreateEvent = () => {

        setEditingEvent(null);

        setEventForm({
            ...emptyEventForm,
        });

        setError("");

        setSuccess("");

        setEventDialogOpen(true);
    };


    // =====================================================
    // OPEN EDIT EVENT
    // =====================================================

    const openEditEvent = (event) => {

        setEditingEvent(event);

        setEventForm({
            template_id:
                event.template_id || "",

            title:
                event.title || "",

            description:
                event.description || "",

            event_type:
                event.event_type || "",

            date:
                event.date || "",

            start_time:
                event.start_time || "",

            end_time:
                event.end_time || "",

            venue:
                event.venue || "",

            credited_hours:
                event.credited_hours ?? "",

            max_volunteers:
                event.max_volunteers ?? "",
        });

        setError("");

        setSuccess("");

        setEventDialogOpen(true);
    };


    // =====================================================
    // CLOSE EVENT DIALOG
    // =====================================================

    const closeEventDialog = () => {

        if (savingEvent) {
            return;
        }

        setEventDialogOpen(false);

        setEditingEvent(null);

        setEventForm({
            ...emptyEventForm,
        });
    };


    // =====================================================
    // CREATE / UPDATE EVENT
    // =====================================================

    const handleSaveEvent = async () => {

        setError("");

        setSuccess("");


        // -------------------------------------------------
        // BASIC VALIDATION
        // -------------------------------------------------

        if (
            !editingEvent &&
            !eventForm.template_id
        ) {

            setError(
                "Please select an event template."
            );

            return;
        }


        if (!eventForm.date) {

            setError(
                "Please select an event date."
            );

            return;
        }


        if (!eventForm.start_time) {

            setError(
                "Please select a start time."
            );

            return;
        }


        if (!eventForm.end_time) {

            setError(
                "Please select an end time."
            );

            return;
        }


        if (
            eventForm.end_time <=
            eventForm.start_time
        ) {

            setError(
                "End time must be after start time."
            );

            return;
        }


        if (!eventForm.venue.trim()) {

            setError(
                "Venue is required."
            );

            return;
        }


        try {

            setSavingEvent(true);


            // =================================================
            // UPDATE EXISTING EVENT
            // =================================================

            if (editingEvent) {

                const updateData = {
                    title:
                        eventForm.title.trim(),

                    description:
                        eventForm.description.trim(),

                    event_type:
                        eventForm.event_type,

                    date:
                        eventForm.date,

                    start_time:
                        eventForm.start_time,

                    end_time:
                        eventForm.end_time,

                    venue:
                        eventForm.venue.trim(),

                    credited_hours:
                        eventForm.credited_hours === ""
                            ? undefined
                            : Number(
                                eventForm.credited_hours
                            ),

                    max_volunteers:
                        eventForm.max_volunteers === ""
                            ? undefined
                            : Number(
                                eventForm.max_volunteers
                            ),
                };


                await api.patch(
                    `/events/${editingEvent.id}`,
                    updateData
                );


                setSuccess(
                    "Event updated successfully."
                );


                closeEventDialog();

                await loadEvents();

                return;
            }


            // =================================================
            // CREATE NEW EVENT
            // =================================================

            const createData = {
                template_id:
                    eventForm.template_id,

                title:
                    eventForm.title.trim() ||
                    undefined,

                description:
                    eventForm.description.trim() ||
                    undefined,

                event_type:
                    eventForm.event_type ||
                    undefined,

                date:
                    eventForm.date,

                start_time:
                    eventForm.start_time,

                end_time:
                    eventForm.end_time,

                venue:
                    eventForm.venue.trim(),

                credited_hours:
                    eventForm.credited_hours === ""
                        ? undefined
                        : Number(
                            eventForm.credited_hours
                        ),

                max_volunteers:
                    eventForm.max_volunteers === ""
                        ? undefined
                        : Number(
                            eventForm.max_volunteers
                        ),
            };


            await api.post(
                "/events",
                createData
            );


            setSuccess(
                "Event created successfully."
            );


            closeEventDialog();

            await loadEvents();

        } catch (error) {

            console.error(
                "Failed to save event:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to save event."
            );

        } finally {

            setSavingEvent(false);

        }
    };


    // =====================================================
    // OPEN CREATE TEMPLATE
    // =====================================================

    const openCreateTemplate = () => {

        setTemplateForm({
            ...emptyTemplateForm,
        });

        setError("");

        setSuccess("");

        setTemplateDialogOpen(true);
    };


    // =====================================================
    // CLOSE TEMPLATE DIALOG
    // =====================================================

    const closeTemplateDialog = () => {

        if (savingTemplate) {
            return;
        }

        setTemplateDialogOpen(false);

        setTemplateForm({
            ...emptyTemplateForm,
        });
    };


    // =====================================================
    // CREATE TEMPLATE
    // =====================================================

    const handleCreateTemplate = async () => {

        setError("");

        setSuccess("");


        if (!templateForm.title.trim()) {

            setError(
                "Template title is required."
            );

            return;
        }


        if (
            templateForm.description.trim()
                .length < 10
        ) {

            setError(
                "Template description must be at least 10 characters."
            );

            return;
        }


        if (!templateForm.event_type) {

            setError(
                "Please select an event type."
            );

            return;
        }


        if (!templateForm.default_hours) {

            setError(
                "Default service hours are required."
            );

            return;
        }


        try {

            setSavingTemplate(true);


            await api.post(
                "/events/templates",
                {
                    title:
                        templateForm.title.trim(),

                    description:
                        templateForm.description.trim(),

                    event_type:
                        templateForm.event_type,

                    default_hours:
                        Number(
                            templateForm.default_hours
                        ),

                    default_capacity:
                        templateForm.default_capacity === ""
                            ? null
                            : Number(
                                templateForm.default_capacity
                            ),

                    default_venue:
                        templateForm.default_venue.trim() ||
                        null,
                }
            );


            setSuccess(
                "Event template created successfully."
            );


            closeTemplateDialog();

            await loadTemplates();

        } catch (error) {

            console.error(
                "Failed to create event template:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to create event template."
            );

        } finally {

            setSavingTemplate(false);

        }
    };


    // =====================================================
    // CONFIRM ACTION
    // =====================================================

    const openConfirmDialog = (
        action,
        event
    ) => {

        setConfirmAction({
            type: action,
            event,
        });

        setConfirmDialogOpen(true);

        setError("");

        setSuccess("");
    };


    // =====================================================
    // CLOSE CONFIRM DIALOG
    // =====================================================

    const closeConfirmDialog = () => {

        if (processingAction) {
            return;
        }

        setConfirmDialogOpen(false);

        setConfirmAction(null);
    };


    // =====================================================
    // EXECUTE EVENT ACTION
    // =====================================================

    const executeEventAction = async () => {

        if (!confirmAction?.event) {
            return;
        }

        const event =
            confirmAction.event;

        const action =
            confirmAction.type;


        try {

            setProcessingAction(true);

            setError("");

            setSuccess("");


            let endpoint = "";

            let successMessage = "";


            if (action === "publish") {

                endpoint =
                    `/events/${event.id}/publish`;

                successMessage =
                    "Event published successfully.";
            }


            if (action === "start") {

                endpoint =
                    `/events/${event.id}/start`;

                successMessage =
                    "Event started successfully.";
            }


            if (action === "complete") {

                endpoint =
                    `/events/${event.id}/complete`;

                successMessage =
                    "Event completed successfully.";
            }


            if (action === "cancel") {

                endpoint =
                    `/events/${event.id}/cancel`;

                successMessage =
                    "Event cancelled successfully.";
            }


            if (action === "delete") {

                await api.delete(
                    `/events/${event.id}`
                );

                successMessage =
                    "Event deleted successfully.";
            } else {

                await api.post(endpoint);
            }


            setSuccess(
                successMessage
            );


            closeConfirmDialog();

            await loadEvents();

        } catch (error) {

            console.error(
                `Failed to ${action} event:`,
                error
            );

            setError(
                error.response?.data?.detail ||
                `Unable to ${action} event.`
            );

        } finally {

            setProcessingAction(false);

        }
    };


    // =====================================================
    // CONFIRM DIALOG TEXT
    // =====================================================

    const getConfirmTitle = () => {

        if (!confirmAction) {
            return "Confirm Action";
        }

        const action =
            confirmAction.type;

        if (action === "publish") {
            return "Publish Event";
        }

        if (action === "start") {
            return "Start Event";
        }

        if (action === "complete") {
            return "Complete Event";
        }

        if (action === "cancel") {
            return "Cancel Event";
        }

        if (action === "delete") {
            return "Delete Event";
        }

        return "Confirm Action";
    };


    const getConfirmMessage = () => {

        if (!confirmAction?.event) {
            return "";
        }

        const event =
            confirmAction.event;

        const action =
            confirmAction.type;


        if (action === "publish") {

            return (
                `Are you sure you want to publish "${event.title}"? `
                + "Volunteers will be able to see the event."
            );
        }


        if (action === "start") {

            return (
                `Mark "${event.title}" as ongoing?`
            );
        }


        if (action === "complete") {

            return (
                `Mark "${event.title}" as completed? `
                + "This will make it a historical record."
            );
        }


        if (action === "cancel") {

            return (
                `Are you sure you want to cancel "${event.title}"?`
            );
        }


        if (action === "delete") {

            return (
                `Are you sure you want to permanently delete `
                + `"${event.title}"? This cannot be undone.`
            );
        }


        return "Are you sure?";
    };


    // =====================================================
    // EVENT ACTION BUTTONS
    // =====================================================

    const EventActions = ({
        event,
    }) => {

        return (
            <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
            >

                {/* EDIT */}

                {(event.status === "draft" ||
                    event.status === "published" ||
                    event.status === "ongoing") && (

                    <Tooltip title="Edit event">

                        <IconButton
                            size="small"
                            onClick={() =>
                                openEditEvent(event)
                            }
                        >
                            <Edit />
                        </IconButton>

                    </Tooltip>
                )}


                {/* PUBLISH */}

                {event.status === "draft" && (

                    <Tooltip title="Publish event">

                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                                openConfirmDialog(
                                    "publish",
                                    event
                                )
                            }
                        >
                            <Publish />
                        </IconButton>

                    </Tooltip>
                )}


                {/* START */}

                {event.status === "published" && (

                    <Tooltip title="Start event">

                        <IconButton
                            size="small"
                            onClick={() =>
                                openConfirmDialog(
                                    "start",
                                    event
                                )
                            }
                        >
                            <PlayArrow />
                        </IconButton>

                    </Tooltip>
                )}


                {/* COMPLETE */}

                {event.status === "ongoing" && (

                    <Tooltip title="Complete event">

                        <IconButton
                            size="small"
                            onClick={() =>
                                openConfirmDialog(
                                    "complete",
                                    event
                                )
                            }
                        >
                            <CheckCircle />
                        </IconButton>

                    </Tooltip>
                )}


                {/* CANCEL */}

                {event.status !== "completed" &&
                    event.status !== "cancelled" && (

                    <Tooltip title="Cancel event">

                        <IconButton
                            size="small"
                            color="warning"
                            onClick={() =>
                                openConfirmDialog(
                                    "cancel",
                                    event
                                )
                            }
                        >
                            <Cancel />
                        </IconButton>

                    </Tooltip>
                )}


                {/* DELETE */}

                {event.status === "draft" && (

                    <Tooltip title="Delete draft">

                        <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                                openConfirmDialog(
                                    "delete",
                                    event
                                )
                            }
                        >
                            <Delete />
                        </IconButton>

                    </Tooltip>
                )}

            </Stack>
        );
    };


    // =====================================================
    // MOBILE EVENT CARD
    // =====================================================

    const MobileEventCard = ({
        event,
    }) => {

        return (
            <Card
                elevation={0}
                sx={{
                    border:
                        "1px solid rgba(75, 22, 76, 0.08)",
                    mb: 2,
                }}
            >

                <CardContent>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            gap: 2,
                        }}
                    >

                        <Box sx={{ minWidth: 0 }}>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {event.title}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {getEventTypeLabel(
                                    event.event_type
                                )}
                            </Typography>

                        </Box>

                        {getStatusChip(
                            event.status
                        )}

                    </Box>


                    <Divider sx={{ my: 2 }} />


                    <Stack spacing={1}>

                        <Box>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Date
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                            >
                                {formatDate(
                                    event.date
                                )}
                            </Typography>

                        </Box>


                        <Box>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Time
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                            >
                                {event.start_time} –{" "}
                                {event.end_time}
                            </Typography>

                        </Box>


                        <Box>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Venue
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                            >
                                {event.venue || "—"}
                            </Typography>

                        </Box>


                        <Box>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Service Hours
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                            >
                                {event.credited_hours}
                            </Typography>

                        </Box>

                    </Stack>


                    <Box sx={{ mt: 2 }}>

                        <EventActions
                            event={event}
                        />

                    </Box>

                </CardContent>

            </Card>
        );
    };


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
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: {
                        xs: "flex-start",
                        sm: "center",
                    },
                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },
                    gap: 2,
                }}
            >

                <Box>

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
                        Event Management
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Create, publish, manage, and track NSS events.
                    </Typography>

                </Box>


                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={1}
                    sx={{
                        width: {
                            xs: "100%",
                            sm: "auto",
                        },
                    }}
                >

                    <Button
                        variant="outlined"
                        startIcon={<Schedule />}
                        onClick={openCreateTemplate}
                        fullWidth
                        sx={{
                            width: {
                                xs: "100%",
                                sm: "auto",
                            },
                        }}
                    >
                        New Template
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openCreateEvent}
                        fullWidth
                        sx={{
                            width: {
                                xs: "100%",
                                sm: "auto",
                            },
                        }}
                    >
                        New Event
                    </Button>

                </Stack>

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
                TEMPLATES
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

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >

                        <Box>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Event Templates
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.25 }}
                            >
                                Reusable templates for common NSS activities.
                            </Typography>

                        </Box>

                    </Box>


                    {templates.length === 0 ? (

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            No event templates have been created yet.
                        </Typography>

                    ) : (

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, 1fr)",
                                    lg: "repeat(3, 1fr)",
                                },
                                gap: 2,
                            }}
                        >

                            {templates.map(
                                (template) => (

                                    <Card
                                        key={
                                            template.id
                                        }
                                        variant="outlined"
                                    >

                                        <CardContent>

                                            <Typography
                                                fontWeight={700}
                                            >
                                                {
                                                    template.title
                                                }
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.75,
                                                }}
                                            >
                                                {
                                                    template.description
                                                }
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                flexWrap="wrap"
                                                useFlexGap
                                                sx={{
                                                    mt: 1.5,
                                                }}
                                            >

                                                <Chip
                                                    size="small"
                                                    label={getEventTypeLabel(
                                                        template.event_type
                                                    )}
                                                />

                                                <Chip
                                                    size="small"
                                                    variant="outlined"
                                                    label={`${template.default_hours} hrs`}
                                                />

                                            </Stack>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display:
                                                        "block",
                                                    mt: 1.5,
                                                }}
                                            >
                                                Venue:{" "}
                                                {template.default_venue ||
                                                    "Not specified"}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display:
                                                        "block",
                                                    mt: 0.5,
                                                }}
                                            >
                                                Capacity:{" "}
                                                {template.default_capacity ||
                                                    "No limit"}
                                            </Typography>

                                        </CardContent>

                                    </Card>

                                )
                            )}

                        </Box>

                    )}

                </CardContent>

            </Card>


            {/* =================================================
                EVENT FILTERS
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

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                md: "2fr 1fr auto",
                            },
                            gap: 2,
                            alignItems: "center",
                        }}
                    >

                        <TextField
                            fullWidth
                            label="Search events"
                            placeholder="Search by title, venue, or description"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <Search
                                            sx={{
                                                mr: 1,
                                                color:
                                                    "text.secondary",
                                            }}
                                        />
                                    ),
                                },
                            }}
                        />


                        <FormControl fullWidth>

                            <InputLabel>
                                Status
                            </InputLabel>

                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <MenuItem value="all">
                                    All statuses
                                </MenuItem>

                                <MenuItem value="draft">
                                    Draft
                                </MenuItem>

                                <MenuItem value="published">
                                    Published
                                </MenuItem>

                                <MenuItem value="ongoing">
                                    Ongoing
                                </MenuItem>

                                <MenuItem value="completed">
                                    Completed
                                </MenuItem>

                                <MenuItem value="cancelled">
                                    Cancelled
                                </MenuItem>

                            </Select>

                        </FormControl>


                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() =>
                                Promise.all([
                                    loadEvents(),
                                    loadTemplates(),
                                ])
                            }
                            disabled={loading}
                            sx={{
                                minHeight: 56,
                            }}
                        >
                            Refresh
                        </Button>

                    </Box>

                </CardContent>

            </Card>


            {/* =================================================
                EVENT COUNT
            ================================================== */}

            <Box sx={{ mb: 2 }}>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Showing{" "}
                    <strong>
                        {filteredEvents.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                        {events.length}
                    </strong>{" "}
                    events
                </Typography>

            </Box>


            {/* =================================================
                LOADING
            ================================================== */}

            {loading ? (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent
                        sx={{
                            minHeight: 240,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                        }}
                    >

                        <Stack
                            spacing={1}
                            alignItems="center"
                        >

                            <CircularProgress />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Loading events...
                            </Typography>

                        </Stack>

                    </CardContent>

                </Card>

            ) : filteredEvents.length === 0 ? (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent
                        sx={{
                            minHeight: 240,
                            display: "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            textAlign: "center",
                        }}
                    >

                        <Box>

                            <EventIcon
                                sx={{
                                    fontSize: 52,
                                    color:
                                        "text.secondary",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                No events found
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                }}
                            >
                                Create an event or change your filters.
                            </Typography>

                        </Box>

                    </CardContent>

                </Card>

            ) : (

                <Box>

                    {filteredEvents.map(
                        (event) => (

                            <MobileEventCard
                                key={event.id}
                                event={event}
                            />

                        )
                    )}

                </Box>

            )}


            {/* =================================================
                CREATE / EDIT EVENT DIALOG
            ================================================== */}

            <Dialog
                open={eventDialogOpen}
                onClose={closeEventDialog}
                fullWidth
                maxWidth="md"
            >

                <DialogTitle>

                    {editingEvent
                        ? "Edit Event"
                        : "Create Event"}

                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2}
                        sx={{ mt: 1 }}
                    >

                        {!editingEvent && (

                            <FormControl fullWidth>

                                <InputLabel>
                                    Event Template
                                </InputLabel>

                                <Select
                                    value={
                                        eventForm.template_id
                                    }
                                    label="Event Template"
                                    onChange={(event) =>
                                        handleEventFormChange(
                                            "template_id",
                                            event.target.value
                                        )
                                    }
                                >

                                    {templates.map(
                                        (template) => (

                                            <MenuItem
                                                key={
                                                    template.id
                                                }
                                                value={
                                                    template.id
                                                }
                                            >
                                                {
                                                    template.title
                                                }
                                            </MenuItem>

                                        )
                                    )}

                                </Select>

                            </FormControl>

                        )}


                        <TextField
                            fullWidth
                            label="Event Title"
                            value={
                                eventForm.title
                            }
                            onChange={(event) =>
                                handleEventFormChange(
                                    "title",
                                    event.target.value
                                )
                            }
                            placeholder="Leave empty to use template title"
                        />


                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Description"
                            value={
                                eventForm.description
                            }
                            onChange={(event) =>
                                handleEventFormChange(
                                    "description",
                                    event.target.value
                                )
                            }
                            placeholder="Leave empty to use template description"
                        />


                        <FormControl fullWidth>

                            <InputLabel>
                                Event Type
                            </InputLabel>

                            <Select
                                value={
                                    eventForm.event_type
                                }
                                label="Event Type"
                                onChange={(event) =>
                                    handleEventFormChange(
                                        "event_type",
                                        event.target.value
                                    )
                                }
                            >

                                {EVENT_TYPES.map(
                                    (type) => (

                                        <MenuItem
                                            key={
                                                type.value
                                            }
                                            value={
                                                type.value
                                            }
                                        >
                                            {
                                                type.label
                                            }
                                        </MenuItem>

                                    )
                                )}

                            </Select>

                        </FormControl>


                        <Grid
                            container
                            spacing={2}
                        >

                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6,
                                }}
                            >

                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date"
                                    value={
                                        eventForm.date
                                    }
                                    onChange={(event) =>
                                        handleEventFormChange(
                                            "date",
                                            event.target.value
                                        )
                                    }
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                />

                            </Grid>


                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 3,
                                }}
                            >

                                <TextField
                                    fullWidth
                                    type="time"
                                    label="Start Time"
                                    value={
                                        eventForm.start_time
                                    }
                                    onChange={(event) =>
                                        handleEventFormChange(
                                            "start_time",
                                            event.target.value
                                        )
                                    }
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                />

                            </Grid>


                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 3,
                                }}
                            >

                                <TextField
                                    fullWidth
                                    type="time"
                                    label="End Time"
                                    value={
                                        eventForm.end_time
                                    }
                                    onChange={(event) =>
                                        handleEventFormChange(
                                            "end_time",
                                            event.target.value
                                        )
                                    }
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                />

                            </Grid>

                        </Grid>


                        <TextField
                            fullWidth
                            label="Venue"
                            value={
                                eventForm.venue
                            }
                            onChange={(event) =>
                                handleEventFormChange(
                                    "venue",
                                    event.target.value
                                )
                            }
                            placeholder="Event location"
                        />


                        <Grid
                            container
                            spacing={2}
                        >

                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6,
                                }}
                            >

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Credited Hours"
                                    value={
                                        eventForm.credited_hours
                                    }
                                    onChange={(event) =>
                                        handleEventFormChange(
                                            "credited_hours",
                                            event.target.value
                                        )
                                    }
                                    inputProps={{
                                        min: 0.1,
                                        max: 24,
                                        step: 0.1,
                                    }}
                                    placeholder="e.g. 3"
                                />

                            </Grid>


                            <Grid
                                size={{
                                    xs: 12,
                                    sm: 6,
                                }}
                            >

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Maximum Volunteers"
                                    value={
                                        eventForm.max_volunteers
                                    }
                                    onChange={(event) =>
                                        handleEventFormChange(
                                            "max_volunteers",
                                            event.target.value
                                        )
                                    }
                                    inputProps={{
                                        min: 1,
                                        max: 10000,
                                        step: 1,
                                    }}
                                    placeholder="Optional"
                                />

                            </Grid>

                        </Grid>

                    </Stack>

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={closeEventDialog}
                        disabled={savingEvent}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSaveEvent}
                        disabled={savingEvent}
                    >
                        {savingEvent
                            ? "Saving..."
                            : editingEvent
                                ? "Save Changes"
                                : "Create Event"}
                    </Button>

                </DialogActions>

            </Dialog>


            {/* =================================================
                CREATE TEMPLATE DIALOG
            ================================================== */}

            <Dialog
                open={templateDialogOpen}
                onClose={closeTemplateDialog}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Create Event Template
                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2}
                        sx={{ mt: 1 }}
                    >

                        <TextField
                            fullWidth
                            label="Template Title"
                            value={
                                templateForm.title
                            }
                            onChange={(event) =>
                                handleTemplateFormChange(
                                    "title",
                                    event.target.value
                                )
                            }
                            placeholder="e.g. Blood Donation Camp"
                        />


                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label="Description"
                            value={
                                templateForm.description
                            }
                            onChange={(event) =>
                                handleTemplateFormChange(
                                    "description",
                                    event.target.value
                                )
                            }
                            placeholder="Describe the standard event..."
                        />


                        <FormControl fullWidth>

                            <InputLabel>
                                Event Type
                            </InputLabel>

                            <Select
                                value={
                                    templateForm.event_type
                                }
                                label="Event Type"
                                onChange={(event) =>
                                    handleTemplateFormChange(
                                        "event_type",
                                        event.target.value
                                    )
                                }
                            >

                                {EVENT_TYPES.map(
                                    (type) => (

                                        <MenuItem
                                            key={
                                                type.value
                                            }
                                            value={
                                                type.value
                                            }
                                        >
                                            {
                                                type.label
                                            }
                                        </MenuItem>

                                    )
                                )}

                            </Select>

                        </FormControl>


                        <TextField
                            fullWidth
                            type="number"
                            label="Default Service Hours"
                            value={
                                templateForm.default_hours
                            }
                            onChange={(event) =>
                                handleTemplateFormChange(
                                    "default_hours",
                                    event.target.value
                                )
                            }
                            inputProps={{
                                min: 0.1,
                                max: 24,
                                step: 0.1,
                            }}
                        />


                        <TextField
                            fullWidth
                            type="number"
                            label="Default Capacity"
                            value={
                                templateForm.default_capacity
                            }
                            onChange={(event) =>
                                handleTemplateFormChange(
                                    "default_capacity",
                                    event.target.value
                                )
                            }
                            inputProps={{
                                min: 1,
                                max: 10000,
                                step: 1,
                            }}
                            placeholder="Optional"
                        />


                        <TextField
                            fullWidth
                            label="Default Venue"
                            value={
                                templateForm.default_venue
                            }
                            onChange={(event) =>
                                handleTemplateFormChange(
                                    "default_venue",
                                    event.target.value
                                )
                            }
                            placeholder="Optional"
                        />

                    </Stack>

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={closeTemplateDialog}
                        disabled={savingTemplate}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handleCreateTemplate
                        }
                        disabled={
                            savingTemplate
                        }
                    >
                        {savingTemplate
                            ? "Creating..."
                            : "Create Template"}
                    </Button>

                </DialogActions>

            </Dialog>


            {/* =================================================
                CONFIRM ACTION DIALOG
            ================================================== */}

            <Dialog
                open={confirmDialogOpen}
                onClose={
                    closeConfirmDialog
                }
                fullWidth
                maxWidth="xs"
            >

                <DialogTitle>
                    {getConfirmTitle()}
                </DialogTitle>


                <DialogContent>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {getConfirmMessage()}
                    </Typography>

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={
                            closeConfirmDialog
                        }
                        disabled={
                            processingAction
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color={
                            confirmAction?.type ===
                            "delete"
                                ? "error"
                                : "primary"
                        }
                        onClick={
                            executeEventAction
                        }
                        disabled={
                            processingAction
                        }
                    >
                        {processingAction
                            ? "Processing..."
                            : "Confirm"}
                    </Button>

                </DialogActions>

            </Dialog>

        </AdminDashboardLayout>
    );
}


export default Events;