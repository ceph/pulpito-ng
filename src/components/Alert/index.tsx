import { Notification } from "@mantine/core";
import { useEffect, useState } from "react";

type AlertProps = {
    severity: "success" | "error",
    message: string,
};

export default function AlertComponent(props: AlertProps) {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => setIsOpen(false), 3000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Notification
            color={props.severity === "error" ? "red" : "green"}
            onClose={() => setIsOpen(false)}
            withBorder
            style={{ position: "fixed", bottom: 24, left: 24, zIndex: 1400, minWidth: 288 }}
        >
            {props.message}
        </Notification>
    );
}
