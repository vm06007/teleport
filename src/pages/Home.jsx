import { Box } from "@mui/material";
import React from "react";
import Navbar from "../components/Navbars/MainNavbar";
import Footer from "../components/Footers/MainFooter";

const Home = () => {
    return (
        <div>
            <Navbar />
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <Box sx={{ bgcolor: "background.default", position: "relative" }}>
                <Footer />
            </Box>
        </div>
    );
};

export default Home;
