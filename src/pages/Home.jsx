import { Box } from "@mui/material";
import React from "react";
import Footer from "../components/Footers/MainFooter";
import Navbar from "../components/Navbars/MainNavbar";
import SectionMain from "../containers/SectionMain";
import SectionTeleport from "../containers/SectionTeleport";

const Home = () => {
    return (
        <div>
            <Navbar />
            <SectionMain />
            <SectionTeleport />
            <Box sx={{ bgcolor: "background.default", position: "relative" }}>
                <Footer />
            </Box>
        </div>
    );
};

export default Home;
