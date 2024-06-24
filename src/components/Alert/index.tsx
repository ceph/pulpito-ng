import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useState } from "react";

type AlertProps = {
    severity: "success" | "error",
    message: string,
};

export default function AlertComponent(props: AlertProps) {
    const [isOpen, setIsOpen] = useState(true);
    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
          return;
        }
        setIsOpen(false);
    };

    return (
        <Snackbar autoHideDuration={3000} open={isOpen} onClose={handleClose}>
            <Alert onClose={handleClose} severity={props.severity} sx={{ width: "100%" }}>
              {props.message}
            </Alert>
        </Snackbar>
    );
}