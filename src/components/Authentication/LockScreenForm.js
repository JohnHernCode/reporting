"use client";

import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import styles from "@/components/Authentication/Authentication.module.css";
import Image from "next/image";

const LockScreenForm = () => {
  const [email, setEmail] = useState(""); // State to track email input
  const [password, setPassword] = useState(""); // State to track password input
  const [error, setError] = useState(""); // State to track errors

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await fetch("/api/sharing/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error logging in.");
      }

      const data = await response.json();

      // Store shareId in localStorage
      localStorage.setItem("shareId", data.shareId);

      // Redirect to the audio screen
      window.location.href = `/authentication/audio-screen`;
    } catch (err) {
      setError(err.message || "Error logging in.");
    }
  };

  return (
    <div className="authenticationBox">
      <Box
        component="main"
        sx={{
          maxWidth: "510px",
          ml: "auto",
          mr: "auto",
          padding: "80px 0 100px",
        }}
      >
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <Box>
            <Box component="form" noValidate onSubmit={handleSubmit}>
              <div className={styles.profileBox}>
                <div className={styles.header}>
                  <div className={styles.headerContent}>
                    <h1>Welcome to your shared audio!</h1>
                    <p>
                      Please input your email and password to view and listen
                      to the file.
                    </p>
                  </div>
                  <Image
                    src="/images/working-on-table.png"
                    alt="Working on table"
                    width={187}
                    height={152}
                    priority={true}
                  />
                </div>
              </div>

              <Box
                sx={{
                  background: "#fff",
                  padding: "30px 20px",
                  mb: "20px",
                }}
                className="bg-black"
              >
                <Grid container alignItems="center" spacing={2}>
                  {/* Email Input */}
                  <Grid item xs={12}>
                    <Typography
                      component="label"
                      sx={{
                        fontWeight: "500",
                        fontSize: "14px",
                        mb: "10px",
                        display: "block",
                      }}
                    >
                      Email
                    </Typography>

                    <TextField
                      required
                      fullWidth
                      name="email"
                      label="Email"
                      type="email"
                      id="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} // Update email state
                      InputProps={{
                        style: { borderRadius: 8 },
                      }}
                    />
                  </Grid>

                  {/* Password Input */}
                  <Grid item xs={12}>
                    <Typography
                      component="label"
                      sx={{
                        fontWeight: "500",
                        fontSize: "14px",
                        mb: "10px",
                        display: "block",
                      }}
                    >
                      Password
                    </Typography>

                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} // Update password state
                      InputProps={{
                        style: { borderRadius: 8 },
                      }}
                    />
                  </Grid>

                  {/* Submit Button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        textTransform: "capitalize",
                        borderRadius: "8px",
                        fontWeight: "500",
                        fontSize: "16px",
                        padding: "12px 10px",
                        color: "#fff !important",
                      }}
                    >
                      Unlock
                    </Button>
                  </Grid>

                  {/* Error Message */}
                  {error && (
                    <Grid item xs={12}>
                      <Typography
                        color="error"
                        sx={{
                          mt: 2,
                          fontSize: "14px",
                        }}
                      >
                        {error}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>
    </div>
  );
};

export default LockScreenForm;
