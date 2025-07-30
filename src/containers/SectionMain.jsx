import {
    Box,
    Container,
    Hidden,
    Stack,
    useTheme,
} from "@mui/material";
import React from "react";
import { sectionMainContent } from "../utils/content";
import useMeasure from "react-use-measure";
import Title from "../components/Title";

const {
    MainBG,
    TreesImage,
    CliffImage,
    HorseImage,
    ShootingStarImage,
} = sectionMainContent;


const SectionMain = () => {
    const theme = useTheme();
    // const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

    const [ref, { height }] = useMeasure();

    return (
        <Box sx={{ width: "100%" }}>
            {/* Main Background */}
            <Box sx={{ position: "fixed", zIndex: -10, top: 0, left: 0, right: 0 }}>
                <img src={"https://ethglobal.b-cdn.net/events/unite/images/xzcwd/default.jpg"} style={{ width: "100%", opacity: 1, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
                <img src={MainBG} style={{ width: "100%", opacity: 0.4, position: "absolute", height: "900px", top: 0, left: 0, right: 0, bottom: 0 }} />
            </Box>

            {/* backgrounds elements */}
            <Box
                ref={ref}
                sx={{
                    position: "absolute",
                    width: "100%",
                    zIndex: -1,
                    top: 0,
                    left: 0,
                    right: 0,
                }}
            >
                <img src={MainBG} style={{ width: "100%", opacity: 0 }} />

                {/* Star */}
                <img
                    src={ShootingStarImage}
                    style={{
                        position: "absolute",
                        top: "30px",
                        right: "15%",
                        width: "500px",
                    }}
                />

                {/* Trees */}
                <Hidden mdDown>
                    <img
                        src={TreesImage}
                        style={{
                            position: "absolute",
                            width: "100%",
                            right: 0,
                            left: 0,
                            bottom: "13%",
                        }}
                    />
                </Hidden>

                {/* Cliff */}
                <img
                    src={CliffImage}
                    style={{
                        height: "100%",
                        position: "absolute",
                        right: 0,
                        top: 0,
                        backgroundSize: "cover",
                    }}
                />

                {/* Horse */}
                <img
                    src={HorseImage}
                    style={{
                        position: "absolute",
                        height: "38%",
                        right: "14%",
                        bottom: "45%",
                        transform: "rotate(7deg)",
                    }}
                />

                <Box
                    sx={{
                        bgcolor: "background.default",
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "800px",
                        top: `calc(${height}px - 13%)`,
                    }}
                ></Box>
            </Box>

            {/* Content */}
            <Container
                sx={{
                    height: "70vh",
                    mt: 0,
                    [theme.breakpoints.up("md")]: { mt: 3 },
                }}
            >
                <Stack sx={{ height: "100%" }} justifyContent="center">
                    <img src={"https://ethglobal.storage/events/unite/logo/default"} style={{ maxWidth: "600px" }} />

                    <Title
                        variant={{ xs: "h4", sm: "h3", md: "h2" }}
                        sx={{ fontWeight: 500, letterSpacing: "0.05em", mt: 2 }}
                    >
                        Teleport Between Protocols
                    </Title>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        alignItems="center"
                        spacing={4}
                    >
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default SectionMain;
