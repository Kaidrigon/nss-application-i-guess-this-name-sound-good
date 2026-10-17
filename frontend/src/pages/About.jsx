import {
    ArrowForward,
    AutoAwesome,
    Campaign,
    Email,
    Favorite,
    Groups,
    Lightbulb,
    RocketLaunch,
    School,
    Star,
    VolunteerActivism,
    CheckCircle,
    CalendarMonth,
    Description,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

function About() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                position: "relative",
                overflow: "hidden",
                background:
                    "linear-gradient(180deg, #fff8fa 0%, #ffffff 45%, #fff7f8 100%)",

                "@keyframes floatPurple": {
                    "0%, 100%": {
                        transform: "translate3d(0, 0, 0) scale(1)",
                    },
                    "25%": {
                        transform:
                            "translate3d(100px, 70px, 0) scale(1.08)",
                    },
                    "50%": {
                        transform:
                            "translate3d(180px, -20px, 0) scale(0.94)",
                    },
                    "75%": {
                        transform:
                            "translate3d(60px, -100px, 0) scale(1.06)",
                    },
                },

                "@keyframes floatPink": {
                    "0%, 100%": {
                        transform: "translate3d(0, 0, 0) scale(1)",
                    },
                    "25%": {
                        transform:
                            "translate3d(-110px, 90px, 0) scale(0.92)",
                    },
                    "50%": {
                        transform:
                            "translate3d(-50px, -110px, 0) scale(1.08)",
                    },
                    "75%": {
                        transform:
                            "translate3d(90px, -50px, 0) scale(0.96)",
                    },
                },

                "@keyframes floatBurgundy": {
                    "0%, 100%": {
                        transform: "translate3d(0, 0, 0) scale(1)",
                    },
                    "33%": {
                        transform:
                            "translate3d(120px, -80px, 0) scale(1.1)",
                    },
                    "66%": {
                        transform:
                            "translate3d(-80px, -130px, 0) scale(0.9)",
                    },
                },

                "@keyframes drift": {
                    "0%, 100%": {
                        transform: "translate3d(0, 0, 0)",
                    },
                    "50%": {
                        transform: "translate3d(0, -25px, 0)",
                    },
                },

                "@media (prefers-reduced-motion: reduce)": {
                    "& .about-animated": {
                        animation: "none !important",
                    },
                },
            }}
        >
            {/* =====================================================
                LIVING BACKGROUND
            ===================================================== */}

            <Box
                className="about-animated"
                sx={{
                    position: "fixed",
                    inset: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            >
                {/* Purple orb */}
                <Box
                    sx={{
                        position: "absolute",
                        width: {
                            xs: 280,
                            md: 560,
                        },
                        height: {
                            xs: 280,
                            md: 560,
                        },
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(75,22,76,0.20) 0%, rgba(75,22,76,0.08) 35%, rgba(75,22,76,0) 72%)",
                        top: -150,
                        left: -150,
                        filter: "blur(8px)",
                        animation:
                            "floatPurple 15s ease-in-out infinite",
                    }}
                />

                {/* Pink orb */}
                <Box
                    sx={{
                        position: "absolute",
                        width: {
                            xs: 260,
                            md: 520,
                        },
                        height: {
                            xs: 260,
                            md: 520,
                        },
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(178,58,72,0.20) 0%, rgba(178,58,72,0.08) 35%, rgba(178,58,72,0) 72%)",
                        top: "18%",
                        right: -160,
                        filter: "blur(10px)",
                        animation:
                            "floatPink 19s ease-in-out infinite",
                    }}
                />

                {/* Burgundy orb */}
                <Box
                    sx={{
                        position: "absolute",
                        width: {
                            xs: 230,
                            md: 460,
                        },
                        height: {
                            xs: 230,
                            md: 460,
                        },
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(123,30,58,0.16) 0%, rgba(123,30,58,0.06) 38%, rgba(123,30,58,0) 72%)",
                        bottom: "5%",
                        left: "10%",
                        filter: "blur(12px)",
                        animation:
                            "floatBurgundy 22s ease-in-out infinite",
                    }}
                />

                {/* Small floating glow */}
                <Box
                    sx={{
                        position: "absolute",
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(255,170,180,0.16), transparent 70%)",
                        top: "48%",
                        left: "42%",
                        filter: "blur(14px)",
                        animation:
                            "drift 9s ease-in-out infinite",
                    }}
                />
            </Box>

            {/* =====================================================
                PAGE CONTENT
            ===================================================== */}

            <Box
                sx={{
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* =====================================================
                    HERO
                ===================================================== */}

                <Box
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        pt: {
                            xs: 7,
                            sm: 10,
                            md: 13,
                        },
                        pb: {
                            xs: 8,
                            sm: 11,
                            md: 14,
                        },
                    }}
                >
                    <Container maxWidth="lg">
                        <Box
                            sx={{
                                maxWidth: 850,
                                mx: "auto",
                                textAlign: "center",
                            }}
                        >
                            <Chip
                                icon={<AutoAwesome />}
                                label="NSS Management & Community Engagement System"
                                sx={{
                                    mb: 3,
                                    px: 1,
                                    py: 2.5,
                                    borderRadius: 5,
                                    backgroundColor:
                                        "rgba(123,30,58,0.08)",
                                    color: "#7B1E3A",
                                    fontWeight: 700,
                                }}
                            />

                            <Typography
                                variant="h1"
                                fontWeight={900}
                                sx={{
                                    fontSize: {
                                        xs: "2.7rem",
                                        sm: "4rem",
                                        md: "5.3rem",
                                    },
                                    lineHeight: 0.98,
                                    letterSpacing: "-0.045em",
                                    background:
                                        "linear-gradient(135deg, #4B164C 10%, #7B1E3A 55%, #B23A48 90%)",
                                    WebkitBackgroundClip:
                                        "text",
                                    WebkitTextFillColor:
                                        "transparent",
                                }}
                            >
                                Built for Service.
                                <br />
                                Designed for People.
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 3,
                                    mx: "auto",
                                    maxWidth: 700,
                                    fontSize: {
                                        xs: "1.05rem",
                                        sm: "1.2rem",
                                    },
                                    lineHeight: 1.8,
                                    color: "text.secondary",
                                }}
                            >
                                A small attempt to make NSS
                                participation simpler, more organized,
                                more transparent, and a little more
                                meaningful for everyone involved.
                            </Typography>

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={1.5}
                                sx={{
                                    mt: 4,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    endIcon={<ArrowForward />}
                                    onClick={() =>
                                        navigate("/register")
                                    }
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.4,
                                        fontWeight: 700,
                                        background:
                                            "linear-gradient(135deg, #4B164C, #7B1E3A)",
                                        boxShadow:
                                            "0 12px 30px rgba(75,22,76,0.2)",
                                        "&:hover": {
                                            background:
                                                "linear-gradient(135deg, #3A103B, #68182F)",
                                        },
                                    }}
                                >
                                    Explore the Platform
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        document
                                            .getElementById("story")
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                            })
                                    }
                                    sx={{
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.4,
                                        fontWeight: 700,
                                        borderColor:
                                            "rgba(75,22,76,0.2)",
                                        color: "#4B164C",
                                    }}
                                >
                                    Read Our Story
                                </Button>
                            </Stack>
                        </Box>
                    </Container>
                </Box>

                {/* =====================================================
                    STORY
                ===================================================== */}

                <Box
                    id="story"
                    sx={{
                        py: {
                            xs: 7,
                            md: 11,
                        },
                    }}
                >
                    <Container maxWidth="lg">
                        <SectionHeading
                            eyebrow="WHY THIS EXISTS"
                            title="Because good work deserves a better system."
                            description="NSS is about people giving their time to their community. The technology should make that easier — not become another thing they have to struggle with."
                        />

                        <Grid
                            container
                            spacing={3}
                            sx={{ mt: 2 }}
                        >
                            <Grid size={{ xs: 12, md: 4 }}>
                                <StoryCard
                                    icon={<Campaign />}
                                    number="01"
                                    title="Too many scattered places"
                                    text="Event announcements, registrations, attendance records, photographs and service hours can easily end up spread across WhatsApp groups, paper registers and different forms."
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <StoryCard
                                    icon={<Lightbulb />}
                                    number="02"
                                    title="A simpler idea"
                                    text="What if volunteers could see events, register, track their participation and understand their NSS journey from one place?"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <StoryCard
                                    icon={<RocketLaunch />}
                                    number="03"
                                    title="So we built it"
                                    text="This platform brings the important pieces together while keeping the experience simple enough for volunteers, coordinators and administrators."
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* =====================================================
                    WHAT WE BUILT
                ===================================================== */}

                <Box
                    sx={{
                        py: {
                            xs: 7,
                            md: 11,
                        },
                        background:
                            "linear-gradient(135deg, #4B164C 0%, #641B3D 50%, #7B1E3A 100%)",
                        color: "white",
                    }}
                >
                    <Container maxWidth="lg">
                        <Box
                            sx={{
                                maxWidth: 720,
                                mb: 6,
                            }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    letterSpacing: 2,
                                    fontWeight: 800,
                                    opacity: 0.7,
                                }}
                            >
                                WHAT WE BUILT
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight={900}
                                sx={{
                                    mt: 1,
                                    fontSize: {
                                        xs: "2rem",
                                        md: "3.2rem",
                                    },
                                }}
                            >
                                Everything important,
                                <br />
                                in one place.
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 2,
                                    opacity: 0.78,
                                    lineHeight: 1.8,
                                }}
                            >
                                The platform is designed around the
                                actual NSS workflow rather than trying
                                to turn community service into
                                complicated software.
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <FeatureCard
                                icon={<CalendarMonth />}
                                title="Events"
                                text="Create, publish and discover NSS activities."
                            />

                            <FeatureCard
                                icon={<CheckCircle />}
                                title="Attendance"
                                text="Keep participation records organized and accessible."
                            />

                            <FeatureCard
                                icon={<VolunteerActivism />}
                                title="Service Hours"
                                text="Track progress toward the NSS service requirement."
                            />

                            <FeatureCard
                                icon={<Description />}
                                title="Documents"
                                text="Keep important certificates and documents together."
                            />

                            <FeatureCard
                                icon={<Groups />}
                                title="Community"
                                text="Connect volunteers, coordinators and administrators."
                            />

                            <FeatureCard
                                icon={<AutoAwesome />}
                                title="Reports"
                                text="Turn participation data into useful reports."
                            />
                        </Grid>
                    </Container>
                </Box>

                {/* =====================================================
                    VISION
                ===================================================== */}

                <Box
                    sx={{
                        py: {
                            xs: 7,
                            md: 11,
                        },
                    }}
                >
                    <Container maxWidth="lg">
                        <Grid
                            container
                            spacing={6}
                            sx={{
                                alignItems: "center",
                            }}
                        >
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Chip
                                    label="THE FUTURE"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 800,
                                        color: "#7B1E3A",
                                        backgroundColor:
                                            "rgba(123,30,58,0.08)",
                                    }}
                                />

                                <Typography
                                    variant="h3"
                                    fontWeight={900}
                                    sx={{
                                        fontSize: {
                                            xs: "2.2rem",
                                            md: "3.3rem",
                                        },
                                        lineHeight: 1.1,
                                    }}
                                >
                                    This is only
                                    <br />
                                    the beginning.
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 3,
                                        lineHeight: 1.9,
                                        color: "text.secondary",
                                    }}
                                >
                                    The goal isn't simply to replace a
                                    spreadsheet or a WhatsApp group.
                                    The long-term vision is to create a
                                    digital home for NSS participation —
                                    one that can grow with volunteers,
                                    coordinators and the communities
                                    they serve.
                                </Typography>

                                <Stack spacing={2} sx={{ mt: 3 }}>
                                    <VisionItem text="Better volunteer experiences" />
                                    <VisionItem text="Smarter event management" />
                                    <VisionItem text="More meaningful participation data" />
                                    <VisionItem text="Stronger community engagement" />
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box
                                    sx={{
                                        position: "relative",
                                        minHeight: {
                                            xs: 320,
                                            md: 430,
                                        },
                                        borderRadius: 6,
                                        overflow: "hidden",
                                        background:
                                            "linear-gradient(135deg, rgba(75,22,76,0.96), rgba(178,58,72,0.95))",
                                        boxShadow:
                                            "0 30px 70px rgba(75,22,76,0.18)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        p: 4,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            width: 260,
                                            height: 260,
                                            borderRadius: "50%",
                                            border:
                                                "1px solid rgba(255,255,255,0.15)",
                                            top: -80,
                                            right: -60,
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            position: "absolute",
                                            width: 180,
                                            height: 180,
                                            borderRadius: "50%",
                                            border:
                                                "1px solid rgba(255,255,255,0.12)",
                                            bottom: -70,
                                            left: -50,
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            position: "relative",
                                            textAlign: "center",
                                            maxWidth: 430,
                                            color: "white",
                                        }}
                                    >
                                        <Star
                                            sx={{
                                                fontSize: 55,
                                                mb: 2,
                                            }}
                                        />

                                        <Typography
                                            variant="h4"
                                            fontWeight={900}
                                        >
                                            Technology should
                                            serve people.
                                        </Typography>

                                        <Typography
                                            sx={{
                                                mt: 2,
                                                lineHeight: 1.8,
                                                opacity: 0.78,
                                            }}
                                        >
                                            Not the other way around.
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* =====================================================
                    PERSONAL NOTE
                ===================================================== */}

                <Box
                    sx={{
                        py: {
                            xs: 7,
                            md: 11,
                        },
                        backgroundColor: "#fff5f7",
                    }}
                >
                    <Container maxWidth="md">
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 5,
                                border:
                                    "1px solid rgba(75,22,76,0.08)",
                                backgroundColor:
                                    "rgba(255,255,255,0.82)",
                                boxShadow:
                                    "0 25px 70px rgba(75,22,76,0.08)",
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: {
                                        xs: 3,
                                        sm: 5,
                                        md: 7,
                                    },
                                }}
                            >
                                <Chip
                                    icon={<Favorite />}
                                    label="A PERSONAL NOTE"
                                    sx={{
                                        mb: 3,
                                        fontWeight: 800,
                                        color: "#B23A48",
                                        backgroundColor:
                                            "rgba(178,58,72,0.08)",
                                    }}
                                />

                                <Typography
                                    variant="h4"
                                    fontWeight={900}
                                    sx={{
                                        fontSize: {
                                            xs: "2rem",
                                            md: "2.8rem",
                                        },
                                    }}
                                >
                                    Why I wanted to build this.
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 3,
                                        lineHeight: 2,
                                        color: "text.secondary",
                                    }}
                                >
                                    This project started as an attempt
                                    to solve a very practical problem:
                                    making NSS activities easier to
                                    manage.
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 2,
                                        lineHeight: 2,
                                        color: "text.secondary",
                                    }}
                                >
                                    But somewhere along the way, it
                                    became more than just a college
                                    project. It became an opportunity to
                                    learn how software can actually
                                    support people, teams and
                                    communities.
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 2,
                                        lineHeight: 2,
                                        color: "text.secondary",
                                    }}
                                >
                                    Every screen, every feature and
                                    every small decision here is an
                                    attempt to make the experience a
                                    little easier for the people who
                                    volunteer their time to help
                                    others.
                                </Typography>

                                <Divider sx={{ my: 4 }} />

                                <Typography
                                    fontWeight={800}
                                    sx={{
                                        color: "#4B164C",
                                        fontSize: "1.1rem",
                                    }}
                                >
                                    Built with curiosity, a lot of
                                    learning, and probably way too much
                                    coffee. ☕
                                </Typography>
                            </CardContent>
                        </Card>
                    </Container>
                </Box>

                {/* =====================================================
                    THANK YOU
                ===================================================== */}

                <Box
                    sx={{
                        py: {
                            xs: 7,
                            md: 10,
                        },
                    }}
                >
                    <Container maxWidth="lg">
                        <SectionHeading
                            eyebrow="WITH GRATITUDE"
                            title="This wasn't built alone."
                            description="A project like this exists because people are willing to give an idea a chance."
                        />

                        <Grid
                            container
                            spacing={3}
                            sx={{ mt: 2 }}
                        >
                            <Grid size={{ xs: 12, md: 4 }}>
                                <ThanksCard
                                    icon={<School />}
                                    title="To the NSS Club"
                                    text="Thank you for trusting me with the opportunity to work on something that can contribute to the way our community works."
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <ThanksCard
                                    icon={<Groups />}
                                    title="To the other code craft club memebers"
                                    text="Thank you for the guidance, patience and the real-world perspective that helped shape this system."
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <ThanksCard
                                    icon={<VolunteerActivism />}
                                    title="To Every Volunteer"
                                    text="This platform exists because of the work you do. Every event, every hour and every act of service is what gives this project meaning."
                                />
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* =====================================================
                    FEEDBACK
                ===================================================== */}

                <Box
                    sx={{
                        py: {
                            xs: 8,
                            md: 12,
                        },
                        px: 2,
                    }}
                >
                    <Container maxWidth="md">
                        <Box
                            sx={{
                                textAlign: "center",
                                p: {
                                    xs: 4,
                                    sm: 6,
                                    md: 8,
                                },
                                borderRadius: 6,
                                background:
                                    "linear-gradient(135deg, #4B164C, #7B1E3A)",
                                color: "white",
                                boxShadow:
                                    "0 30px 80px rgba(75,22,76,0.2)",
                            }}
                        >
                            <Email
                                sx={{
                                    fontSize: 48,
                                    mb: 2,
                                    opacity: 0.9,
                                }}
                            />

                            <Typography
                                variant="h3"
                                fontWeight={900}
                                sx={{
                                    fontSize: {
                                        xs: "2rem",
                                        md: "3rem",
                                    },
                                }}
                            >
                                Have an idea?
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 2,
                                    opacity: 0.8,
                                    lineHeight: 1.8,
                                    maxWidth: 600,
                                    mx: "auto",
                                }}
                            >
                                Found something that could be better?
                                Have a feature you would love to see?
                                Or maybe you simply want to say hello?
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={<Email />}
                                sx={{
                                    mt: 4,
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    backgroundColor: "white",
                                    color: "#4B164C",
                                    fontWeight: 800,
                                    "&:hover": {
                                        backgroundColor: "#fff5f7",
                                    },
                                }}
                                href="mailto:keshav.persona@gmail.com"
                            >
                                Share Your Feedback
                            </Button>

                            <Typography
                                variant="caption"
                                sx={{
                                    display: "block",
                                    mt: 2,
                                    opacity: 0.55,
                                }}
                            >
                                Remember you could give a shape to this 
                                project.
                                
                            </Typography>
                        </Box>
                    </Container>
                </Box>

                {/* =====================================================
                    FINAL
                ===================================================== */}

                <Box
                    sx={{
                        py: 6,
                        textAlign: "center",
                        borderTop:
                            "1px solid rgba(75,22,76,0.08)",
                    }}
                >
                    <Container maxWidth="md">
                        <Favorite
                            sx={{
                                color: "#B23A48",
                                fontSize: 30,
                                mb: 1,
                            }}
                        />

                        <Typography
                            variant="h6"
                            fontWeight={800}
                        >
                            For service. For community. For the people.
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 1,
                                lineHeight: 1.7,
                            }}
                        >
                            Thank you for being a part of the journey.
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{
                                display: "block",
                                mt: 3,
                            }}
                        >
                            NSS Management & Community Engagement System
                        </Typography>
                    </Container>
                </Box>
            </Box>
        </Box>
    );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
    eyebrow,
    title,
    description,
}) {
    return (
        <Box
            sx={{
                maxWidth: 760,
                mx: "auto",
                textAlign: "center",
            }}
        >
            <Typography
                variant="overline"
                sx={{
                    letterSpacing: 2,
                    fontWeight: 900,
                    color: "#B23A48",
                }}
            >
                {eyebrow}
            </Typography>

            <Typography
                variant="h3"
                fontWeight={900}
                sx={{
                    mt: 1,
                    fontSize: {
                        xs: "2rem",
                        md: "3.1rem",
                    },
                    lineHeight: 1.15,
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    mt: 2,
                    color: "text.secondary",
                    lineHeight: 1.8,
                }}
            >
                {description}
            </Typography>
        </Box>
    );
}

/* =========================================================
   STORY CARD
========================================================= */

function StoryCard({
    icon,
    number,
    title,
    text,
}) {
    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                borderRadius: 4,
                border:
                    "1px solid rgba(75,22,76,0.08)",
                backgroundColor: "white",
                boxShadow:
                    "0 15px 45px rgba(75,22,76,0.06)",
            }}
        >
            <CardContent sx={{ p: 3.5 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                                "rgba(178,58,72,0.08)",
                            color: "#B23A48",
                        }}
                    >
                        {icon}
                    </Box>

                    <Typography
                        fontWeight={900}
                        sx={{
                            color:
                                "rgba(75,22,76,0.12)",
                            fontSize: "2rem",
                        }}
                    >
                        {number}
                    </Typography>
                </Box>

                <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ mt: 3 }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 1.5,
                        lineHeight: 1.8,
                    }}
                >
                    {text}
                </Typography>
            </CardContent>
        </Card>
    );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
    icon,
    title,
    text,
}) {
    return (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
                sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 4,
                    border:
                        "1px solid rgba(255,255,255,0.1)",
                    backgroundColor:
                        "rgba(255,255,255,0.055)",
                    transition:
                        "transform 0.2s ease, background 0.2s ease",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        backgroundColor:
                            "rgba(255,255,255,0.09)",
                    },
                }}
            >
                <Box
                    sx={{
                        width: 45,
                        height: 45,
                        borderRadius: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                            "rgba(255,255,255,0.1)",
                        mb: 2,
                    }}
                >
                    {icon}
                </Box>

                <Typography
                    variant="h6"
                    fontWeight={800}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 1,
                        opacity: 0.68,
                        lineHeight: 1.7,
                    }}
                >
                    {text}
                </Typography>
            </Box>
        </Grid>
    );
}

/* =========================================================
   VISION ITEM
========================================================= */

function VisionItem({ text }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
            }}
        >
            <CheckCircle
                sx={{
                    color: "#B23A48",
                    fontSize: 22,
                }}
            />

            <Typography fontWeight={600}>
                {text}
            </Typography>
        </Box>
    );
}

/* =========================================================
   THANKS CARD
========================================================= */

function ThanksCard({
    icon,
    title,
    text,
}) {
    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                borderRadius: 4,
                border:
                    "1px solid rgba(75,22,76,0.08)",
                boxShadow:
                    "0 15px 45px rgba(75,22,76,0.06)",
            }}
        >
            <CardContent
                sx={{
                    p: 3.5,
                    textAlign: "center",
                }}
            >
                <Box
                    sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        mx: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                            "linear-gradient(135deg, #7B1E3A, #B23A48)",
                        color: "white",
                    }}
                >
                    {icon}
                </Box>

                <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ mt: 2.5 }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 1.5,
                        lineHeight: 1.8,
                    }}
                >
                    {text}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default About;