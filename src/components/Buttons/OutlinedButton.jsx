import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const OutlinedButton = ({ sx = {}, arrow, children, fit, ...props }) => {
    const navigate = useNavigate();
    
    const handleClick = () => {
        if (children === "Try Demo") {
            navigate("/teleport");
        }
        // Call the original onClick if provided
        if (props.onClick) {
            props.onClick();
        }
    };

    return (
        <Button
            variant="outlined"
            sx={{
                borderRadius: 2,
                color: "text.primary",
                borderColor: "text.primary",
                width: fit ? "fit-content" : "100%",
                ...sx,
            }}
            onClick={handleClick}
            {...props}
        >
            {children}
            {arrow && <KeyboardArrowRightIcon fontSize="small" sx={{ ml: 0.5 }} />}
        </Button>
    );
};

export default OutlinedButton;
