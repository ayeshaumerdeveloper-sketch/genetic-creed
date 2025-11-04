"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
} from "@mui/material";
import { useGetAccountsQuery } from "@/app/services/accountsApi";
import Image from "next/image";

export default function AccountsPage() {
  const { data, error, isLoading } = useGetAccountsQuery();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Typography>Loading...</Typography>
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" sx={{ mt: 5 }}>
        Error fetching data
      </Typography>
    );

  const accountsData = data?.data || [];

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        p: { xs: 3, md: 6 },
      }}
    >
      {/* ---------- Top Bar ---------- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
        }}
      >
        {/* Left Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Image
            src="/logoagent.svg"
            alt="Agentic Creed"
            width={180}
            height={45}
            priority
          />
        </Box>

        {/* Right Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#d9d9d9",
              color: "#555",
              fontWeight: 500,
              px: 2.5,
              py: 0.8,
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "#ccc",
              },
            }}
          >
            Logout
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#2AB6B6",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 0.9,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#239c9c",
              },
            }}
          >
            Organisation Admin Portal
          </Button>
        </Box>
      </Box>

      {/* ---------- Header ---------- */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#1c1c1c", mb: 1 }}
        >
          Select Company Accounts
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Let’s Proceed!
        </Typography>
      </Box>

      {/* ---------- Cards Grid ---------- */}
      <Grid container spacing={3} justifyContent="center">
        {accountsData.map((company: any) => {
          const isSelected = selectedCompany === company._id;
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={company._id}>
              <Card
                onClick={() => setSelectedCompany(company._id)}
                sx={{
                  cursor: "pointer",
                  borderRadius: "18px",
                  border: isSelected
                    ? "2px solid #2AB6B6"
                    : "1px solid #f1f1f1",
                  transition: "all 0.25s ease",
                  boxShadow:
                    "0px 4px 15px rgba(0, 0, 0, 0.05), 0px 1px 4px rgba(0, 0, 0, 0.03)",
                  "&:hover": {
                    boxShadow:
                      "0px 8px 22px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.04)",
                    transform: "translateY(-4px)",
                  },
                  height: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  p: 1.5,
                }}
              >
                <CardContent>
                  {/* Company Logo + Name */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <Avatar
                      src={
                        company.logo?.url
                          ? `https://gateway-aac.apiswagger.co.uk/${company.logo.url}`
                          : "/placeholder-logo.png"
                      }
                      alt={company.name}
                      variant="square"
                      sx={{
                        width: 34,
                        height: 34,
                        mr: 1.2,
                        borderRadius: 1.5,
                        backgroundColor: "#f9f9f9",
                        objectFit: "contain",
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: "#1c1c1c",
                        fontSize: "1.05rem",
                      }}
                    >
                      {company.name}
                    </Typography>
                  </Box>

                  {/* Accounts List (dynamic from API) */}
                  {company.accounts?.length > 0 ? (
                    company.accounts.map((acc: any) => (
                      <Typography
                        key={acc._id}
                        variant="body2"
                        sx={{
                          ml: 5,
                          mb: 0.7,
                          fontSize: "1rem",
                          color: "#2b2b2b",
                        }}
                      >
                        • {acc.company?.accountName || "Unnamed Account"}
                      </Typography>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ ml: 5, color: "text.secondary" }}
                    >
                      No accounts found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
