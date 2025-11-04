"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Card,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Image from "next/image";
import Link from "next/link";
import { useSigninMutation } from "@/app/services/api";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/features/auth/authSlice";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signin, { isLoading }] = useSigninMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); 

    try {
      const res = await signin({
        email,
        password,
        timezone: "Asia/Karachi",
      }).unwrap();

      console.log("API response:", res);

      const token = res?.data?.accessToken;
      const user = res?.data?.user;

      if (!token) throw new Error("No token received");

      dispatch(setCredentials({ token, user }));
      sessionStorage.setItem("token", token);

      router.push("/companyaccounts");
    } catch (err: any) {
      console.error("Login failed:", err);

      if (err?.data?.message?.toLowerCase().includes("invalid")) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage("Login failed. Please check your credentials or try again later.");
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#fff",
        p: 4,
      }}
    >
      {/* LEFT SIDE */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 4,
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ position: "absolute", top: 24, left: 40 }}>
          <Image src="/logoagent.svg" alt="Agentic Creed Logo" width={140} height={40} priority />
        </Box>

        <Card
          sx={{
            width: 600,
            p: 5,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
            borderRadius: 4,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Sign In to Agentic Creed
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={4}>
            Let’s Get Started
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 45,
                  fontSize: "0.95rem",
                },
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 45,
                  fontSize: "0.95rem",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((show) => !show)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Error Message */}
            {errorMessage && (
              <Typography color="error" sx={{ mt: 1 }}>
                {errorMessage}
              </Typography>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                height: 52,
                fontSize: "1rem",
                bgcolor: "#2cd4c0",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                "&:hover": { bgcolor: "#26bba9" },
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </form>

          <Box textAlign="center" mt={3}>
            <MuiLink href="#" underline="none" color="primary">
              Forgot password?
            </MuiLink>
          </Box>
        </Card>
      </Box>

      {/* RIGHT SIDE */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          backgroundColor: "rgb(245, 245, 245)",
        }}
      >
        <Box sx={{ position: "absolute", top: 24, right: 40 }}>
          <Link href="/signup" passHref>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#2cd4c0",
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                "&:hover": { bgcolor: "#26bba9" },
              }}
            >
              Sign Up
            </Button>
          </Link>
        </Box>

        <Box
          sx={{
            borderRadius: 3,
            p: 2,
          }}
        >
          <Image
            src="/dashboard-preview.webp"
            alt="Dashboard Preview"
            width={800}
            height={400}
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
