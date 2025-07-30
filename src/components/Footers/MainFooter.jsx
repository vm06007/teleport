import {
    Box,
    Container,
    Divider,
    Typography,
} from "@mui/material";
import { footerContent } from "../../utils/content";
import { Stack } from "@mui/system";
import React from "react";

const {
    copyright,
} = footerContent;

const Footer = () => {
    return (
        <Box>
            <Divider sx={{ mb: 5 }} />
            <Container>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    sx={{ pb: 6 }}
                >
                    <Typography variant="body2" color="text.secondary">
                        {copyright.left}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {copyright.center}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {copyright.right}
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
};

export default Footer;
