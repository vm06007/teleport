import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const LaunchButton = ({ sx = {}, ...props }) => {
    const navigate = useNavigate();
    
    const handleClick = () => {
        // Open the deployed Vercel app in a new tab
        window.open("https://teleport-djm2.vercel.app/", "_blank");
        // Call the original onClick if provided
        if (props.onClick) {
            props.onClick();
        }
    };

    return (
        <Button variant="contained" sx={{ borderRadius: 4, ...sx }} onClick={handleClick} {...props}>
            Try Demo
            <KeyboardArrowRightIcon />
        </Button>
    );
};

export default LaunchButton;
