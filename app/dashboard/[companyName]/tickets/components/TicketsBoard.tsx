"use client";

import React from "react";
import { Box, Paper, Typography } from "@mui/material";

export default function TicketsBoard() {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mt: 2,
        flexWrap: "wrap",
        justifyContent: { xs: "center", md: "flex-start" },
      }}
    >
      {["New", "Pending", "Closed", "Open"].map((status) => (
        <Paper
          key={status}
          sx={{
            flex: "1 1 260px",
            p: 2,
            borderRadius: "10px",
            bgcolor: "#f9fafb",
            minHeight: { xs: "180px", sm: "220px" },
            maxWidth: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: "#1f2937",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {status}
          </Typography>
          <Typography
            sx={{
              color: "gray",
              fontSize: 14,
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            (Tickets will appear here)
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
