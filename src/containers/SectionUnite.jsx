import { Container, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import OutlinedButton from "../components/Buttons/OutlinedButton";
import Title from "../components/Title";
import { sectionUniteContent } from "../utils/content";

const { top } = sectionUniteContent;

const SectionUnite = () => {

    return (
        <Container sx={{ mt: { xs: 15, md: 20, lg: 10 } }}>
            {/* TOP */}
            <Grid container spacing={10} flexWrap="wrap-reverse" alignItems="center">
                {/* Left */}
                <Grid item xs={12} md={6}>
                    <Stack spacing={2} sx={{ maxWidth: 480 }}>
                        <Title variant={{ xs: "h3", md: "h2" }}>{top.title}</Title>
                        <Typography variant="body2" color="text.secondary" sx={{ pb: 2 }}>
                            {top.subtitle}
                        </Typography>

                        <OutlinedButton arrow fit>
                            Try Demo
                        </OutlinedButton>
                    </Stack>
                </Grid>
                {/* Right */}
                <Grid item xs={12} md={6}>
                    <img
                        src={top.image}
                        style={{ width: "100%", objectFit: "contain" }}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default SectionUnite;
