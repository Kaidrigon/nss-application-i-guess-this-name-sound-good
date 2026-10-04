    import { useEffect, useState } from "react";

    import {
    Alert,
    Button,
    Snackbar,
    } from "@mui/material";

    function PWAInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // ---------------------------------------------------------
        // ALREADY INSTALLED?
        // ---------------------------------------------------------

        const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

        if (isStandalone) {
        return;
        }

        // ---------------------------------------------------------
        // BROWSER INSTALL EVENT
        // ---------------------------------------------------------

        const handleBeforeInstallPrompt = (event) => {
        // Prevent Chrome from showing its own mini prompt.
        event.preventDefault();

        setInstallPrompt(event);

        // Don't keep showing the prompt if the user dismissed it
        // during this browser session.
        const dismissed = sessionStorage.getItem(
            "pwa_install_dismissed"
        );

        if (!dismissed) {
            setShowPrompt(true);
        }
        };

        window.addEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
        );

        return () => {
        window.removeEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );
        };
    }, []);

    // ---------------------------------------------------------
    // INSTALL APP
    // ---------------------------------------------------------

    const handleInstall = async () => {
        if (!installPrompt) {
        return;
        }

        try {
        await installPrompt.prompt();

        const { outcome } =
            await installPrompt.userChoice;

        if (outcome === "accepted") {
            setShowPrompt(false);
        }

        setInstallPrompt(null);
        } catch (error) {
        console.error(
            "PWA installation failed:",
            error
        );
        }
    };

    // ---------------------------------------------------------
    // DISMISS
    // ---------------------------------------------------------

    const handleDismiss = () => {
        sessionStorage.setItem(
        "pwa_install_dismissed",
        "true"
        );

        setShowPrompt(false);
    };

    if (!showPrompt) {
        return null;
    }

    return (
        <Snackbar
        open={showPrompt}
        anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
        }}
        sx={{
            bottom: {
            xs: 16,
            sm: 24,
            },
            width: {
            xs: "calc(100% - 24px)",
            sm: "auto",
            },
        }}
        >
        <Alert
            severity="info"
            variant="filled"
            sx={{
            width: "100%",
            alignItems: "center",
            borderRadius: 2,
            boxShadow:
                "0 12px 35px rgba(0, 0, 0, 0.18)",
            }}
            action={
            <>
                <Button
                color="inherit"
                size="small"
                onClick={handleInstall}
                sx={{
                    fontWeight: 700,
                }}
                >
                Install App
                </Button>

                <Button
                color="inherit"
                size="small"
                onClick={handleDismiss}
                >
                Not now
                </Button>
            </>
            }
        >
            Install NSS Connect for quickly connect with your NSS units
        </Alert>
        </Snackbar>
    );
    }

    export default PWAInstallPrompt;