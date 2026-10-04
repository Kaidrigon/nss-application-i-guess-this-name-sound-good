import { useEffect, useState } from "react";

import {
Alert,
Box,
Button,
Card,
CardContent,
CircularProgress,
Divider,
Grid,
MenuItem,
Paper,
Select,
Stack,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
Typography,
} from "@mui/material";

import {
Assessment,
Download,
Refresh,
} from "@mui/icons-material";

import AdminDashboardLayout from "../../components/dashboard/AdminDashboardLayout";

import api from "../../services/api";

// =========================================================
// HELPERS
// =========================================================

const formatNumber = (value) => {
if (value === null || value === undefined) {
return "0";
}

return Number(value).toLocaleString();
};

const getPercentage = (attended, registered) => {
if (!registered || registered <= 0) {
return "0%";
}

return `${Math.round(
    (Number(attended) / Number(registered)) * 100
)}%`;

};
// =========================================================
// COMPONENT
// =========================================================

function Reports() {


// =====================================================
// STATE
// =====================================================

const [report, setReport] = useState(null);

const [loading, setLoading] = useState(true);

const [error, setError] = useState("");

const [selectedYear, setSelectedYear] =
    useState("all");


// =====================================================
// LOAD REPORT
// =====================================================

const loadReport = async () => {

    try {

        setLoading(true);

        setError("");

        let response;

        /*
         * We first try the main reports endpoint.
         *
         * If your backend supports a year query parameter,
         * the selected year is passed automatically.
         */

        if (selectedYear === "all") {

            response = await api.get("/reports");

        } else {

            response = await api.get(
                `/reports?year=${selectedYear}`
            );

        }

        setReport(response.data);

    } catch (error) {

        console.error(
            "Failed to load reports:",
            error
        );

        setError(
            error.response?.data?.detail ||
            "Unable to load reports."
        );

    } finally {

        setLoading(false);

    }
};


// =====================================================
// INITIAL / FILTER LOAD
// =====================================================

useEffect(() => {

    loadReport();

}, [selectedYear]);


// =====================================================
// DOWNLOAD REPORT
// =====================================================

const handleDownload = async () => {

    try {

        setError("");

        const response = await api.get(
            selectedYear === "all"
                ? "/reports/export"
                : `/reports/export?year=${selectedYear}`,
            {
                responseType: "blob",
            }
        );

        const blob = new Blob(
            [response.data],
            {
                type:
                    response.headers[
                        "content-type"
                    ] ||
                    "application/octet-stream",
            }
        );

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            selectedYear === "all"
                ? "nss-report"
                : `nss-report-${selectedYear}`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.error(
            "Failed to download report:",
            error
        );

        setError(
            error.response?.data?.detail ||
            "Unable to download report."
        );

    }
};


// =====================================================
// EXTRACT DATA
// =====================================================

const summary =
    report?.summary || report || {};

const yearBreakdown =
    report?.year_breakdown ||
    report?.years ||
    [];

const classBreakdown =
    report?.class_breakdown ||
    report?.classes ||
    [];


const registeredVolunteers =
    summary.registered_volunteers ??
    report?.registered_volunteers ??
    0;

const attendedVolunteers =
    summary.attended_volunteers ??
    report?.attended_volunteers ??
    0;

const totalServiceHours =
    summary.total_service_hours ??
    summary.service_hours ??
    report?.total_service_hours ??
    0;

const totalEvents =
    summary.total_events ??
    report?.total_events ??
    0;


// =====================================================
// LOADING
// =====================================================

if (loading) {

    return (
        <AdminDashboardLayout>

            <Box
                sx={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >

                <Stack
                    spacing={2}
                    alignItems="center"
                >

                    <CircularProgress />

                    <Typography
                        color="text.secondary"
                    >
                        Loading reports...
                    </Typography>

                </Stack>

            </Box>

        </AdminDashboardLayout>
    );
}


// =====================================================
// UI
// =====================================================

return (
    <AdminDashboardLayout>

        {/* =================================================
            HEADER
        ================================================== */}

        <Box
            sx={{
                mb: 4,
                display: "flex",
                justifyContent: "space-between",
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

                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                >

                    <Assessment
                        sx={{
                            fontSize: {
                                xs: 30,
                                sm: 34,
                            },
                        }}
                    />

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
                        Reports
                    </Typography>

                </Stack>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        mt: 0.75,
                    }}
                >
                    NSS participation, attendance, and
                    service-hour reports.
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

                <Select
                    size="small"
                    value={selectedYear}
                    onChange={(event) =>
                        setSelectedYear(
                            event.target.value
                        )
                    }
                    sx={{
                        minWidth: 140,
                    }}
                >

                    <MenuItem value="all">
                        All Years
                    </MenuItem>

                    <MenuItem value="1">
                        Year 1
                    </MenuItem>

                    <MenuItem value="2">
                        Year 2
                    </MenuItem>

                    <MenuItem value="3">
                        Year 3
                    </MenuItem>

                    <MenuItem value="4">
                        Year 4
                    </MenuItem>

                </Select>


                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadReport}
                    fullWidth
                    sx={{
                        width: {
                            xs: "100%",
                            sm: "auto",
                        },
                    }}
                >
                    Refresh
                </Button>


                <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownload}
                    fullWidth
                    sx={{
                        width: {
                            xs: "100%",
                            sm: "auto",
                        },
                    }}
                >
                    Export
                </Button>

            </Stack>

        </Box>


        {/* =================================================
            ERROR
        ================================================== */}

        {error && (

            <Alert
                severity="error"
                sx={{
                    mb: 3,
                    borderRadius: 2,
                }}
                onClose={() =>
                    setError("")
                }
            >
                {error}
            </Alert>

        )}


        {/* =================================================
            SUMMARY CARDS
        ================================================== */}

        <Grid
            container
            spacing={2}
            sx={{
                mb: 3,
            }}
        >

            {/* REGISTERED */}

            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                    lg: 3,
                }}
            >

                <Card
                    elevation={0}
                    sx={{
                        height: "100%",
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Registered Volunteers
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{
                                mt: 1,
                            }}
                        >
                            {formatNumber(
                                registeredVolunteers
                            )}
                        </Typography>

                    </CardContent>

                </Card>

            </Grid>


            {/* ATTENDED */}

            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                    lg: 3,
                }}
            >

                <Card
                    elevation={0}
                    sx={{
                        height: "100%",
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Volunteers Attended
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{
                                mt: 1,
                            }}
                        >
                            {formatNumber(
                                attendedVolunteers
                            )}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {getPercentage(
                                attendedVolunteers,
                                registeredVolunteers
                            )}{" "}
                            attendance
                        </Typography>

                    </CardContent>

                </Card>

            </Grid>


            {/* HOURS */}

            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                    lg: 3,
                }}
            >

                <Card
                    elevation={0}
                    sx={{
                        height: "100%",
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Service Hours
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{
                                mt: 1,
                            }}
                        >
                            {formatNumber(
                                totalServiceHours
                            )}
                        </Typography>

                    </CardContent>

                </Card>

            </Grid>


            {/* EVENTS */}

            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                    lg: 3,
                }}
            >

                <Card
                    elevation={0}
                    sx={{
                        height: "100%",
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Total Events
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{
                                mt: 1,
                            }}
                        >
                            {formatNumber(
                                totalEvents
                            )}
                        </Typography>

                    </CardContent>

                </Card>

            </Grid>

        </Grid>


        {/* =================================================
            YEAR BREAKDOWN
        ================================================== */}

        <Card
            elevation={0}
            sx={{
                mb: 3,
                border:
                    "1px solid rgba(75, 22, 76, 0.08)",
            }}
        >

            <CardContent>

                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    Year Breakdown
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 0.5,
                        mb: 2,
                    }}
                >
                    Volunteer registration and attendance
                    by academic year.
                </Typography>

                <Divider sx={{ mb: 2 }} />


                {yearBreakdown.length === 0 ? (

                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        No year-wise report data available.
                    </Typography>

                ) : (

                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        <strong>Year</strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>
                                            Registered
                                        </strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>
                                            Attended
                                        </strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>
                                            Absent
                                        </strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>
                                            Attendance
                                        </strong>
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {yearBreakdown.map(
                                    (item, index) => {

                                        const registered =
                                            item.registered_volunteers ??
                                            item.registered ??
                                            0;

                                        const attended =
                                            item.attended_volunteers ??
                                            item.attended ??
                                            0;

                                        const absent =
                                            item.absent_volunteers ??
                                            item.absent ??
                                            0;

                                        return (

                                            <TableRow
                                                key={
                                                    item.year ??
                                                    index
                                                }
                                            >

                                                <TableCell>
                                                    Year{" "}
                                                    {
                                                        item.year
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        formatNumber(
                                                            registered
                                                        )
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        formatNumber(
                                                            attended
                                                        )
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        formatNumber(
                                                            absent
                                                        )
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        getPercentage(
                                                            attended,
                                                            registered
                                                        )
                                                    }
                                                </TableCell>

                                            </TableRow>

                                        );
                                    }
                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                )}

            </CardContent>

        </Card>


        {/* =================================================
            CLASS BREAKDOWN
        ================================================== */}

        <Card
            elevation={0}
            sx={{
                mb: 3,
                border:
                    "1px solid rgba(75, 22, 76, 0.08)",
            }}
        >

            <CardContent>

                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    Class Breakdown
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 0.5,
                        mb: 2,
                    }}
                >
                    Volunteer registration and attendance
                    by class.
                </Typography>

                <Divider sx={{ mb: 2 }} />


                {classBreakdown.length === 0 ? (

                    <Typography
                        color="text.secondary"
                        variant="body2"
                    >
                        No class-wise report data available.
                    </Typography>

                ) : (

                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            border:
                                "1px solid rgba(75, 22, 76, 0.08)",
                        }}
                    >

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        <strong>Class</strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>
                                            Registered
                                        </strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>
                                            Attended
                                        </strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>
                                            Absent
                                        </strong>
                                    </TableCell>

                                    <TableCell align="right">
                                        <strong>
                                            Attendance
                                        </strong>
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {classBreakdown.map(
                                    (item, index) => {

                                        const registered =
                                            item.registered_volunteers ??
                                            item.registered ??
                                            0;

                                        const attended =
                                            item.attended_volunteers ??
                                            item.attended ??
                                            0;

                                        const absent =
                                            item.absent_volunteers ??
                                            item.absent ??
                                            0;

                                        return (

                                            <TableRow
                                                key={
                                                    item.class_name ??
                                                    item.class ??
                                                    index
                                                }
                                            >

                                                <TableCell>
                                                    {
                                                        item.class_name ??
                                                        item.class ??
                                                        "Unknown"
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        formatNumber(
                                                            registered
                                                        )
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        formatNumber(
                                                            attended
                                                        )
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        formatNumber(
                                                            absent
                                                        )
                                                    }
                                                </TableCell>

                                                <TableCell align="right">
                                                    {
                                                        getPercentage(
                                                            attended,
                                                            registered
                                                        )
                                                    }
                                                </TableCell>

                                            </TableRow>

                                        );
                                    }
                                )}

                            </TableBody>

                        </Table>

                    </TableContainer>

                )}

            </CardContent>

        </Card>

        {/* =================================================
            RAW REPORT FALLBACK
        ================================================== */}

        {!yearBreakdown.length &&
            !classBreakdown.length &&
            report && (

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid rgba(75, 22, 76, 0.08)",
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                mb: 1,
                            }}
                        >
                            Report Data
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            The backend returned report data,
                            but no year/class breakdown was
                            available to display.
                        </Typography>

                    </CardContent>

                </Card>

            )}

    </AdminDashboardLayout>
);

}
export default Reports;
