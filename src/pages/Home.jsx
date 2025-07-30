import { Box } from "@mui/material";
import React from "react";
import Footer from "../components/Footers/MainFooter";
import Navbar from "../components/Navbars/MainNavbar";
import SectionMain from "../containers/SectionMain";
import SectionTeleport from "../containers/SectionTeleport";
import SectionChains from "../containers/SectionChains";
import SectionProtocols from "../containers/SectionProtocols";

const Home = () => {
    return (
        <div>
            <Navbar />
            <SectionMain />
            <SectionTeleport />
            <Box sx={{ bgcolor: "background.default", position: "relative" }}>
                <SectionChains />
                <SectionProtocols />
                <Footer />
            </Box>
        </div>
    );
};

export default Home;
