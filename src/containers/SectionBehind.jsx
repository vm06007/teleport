import { Container, Grid, Typography } from "@mui/material";
import React from "react";
import ServiceCard from "../components/Cards/ServiceCard";
import Title from "../components/Title";
import { sectionBehindContent } from "../utils/content";

const { title, subtitle, ITEMS } = sectionBehindContent;

const SectionBehind = () => {
    return (
        <Container sx={{ mt: { xs: 10, md: 10, lg: 10 } }}>
            <Title variant={{ xs: "h3", md: "h2" }} sx={{ mb: 2 }}>
                {title}
            </Title>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: { xs: 5, md: 5 } }}
            >
                {subtitle}
            </Typography>
            <Grid container spacing={3}>
                {ITEMS.map((item) => (
                    <Grid item xs={12} md={6} key={item.title}>
                        <ServiceCard {...item} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default SectionBehind;
