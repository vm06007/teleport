import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const LaunchButton = ({ sx = {}, ...props }) => {
    const navigate = useNavigate();
    
    const handleClick = () => {
        navigate("/teleport");
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
