"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import styles from "@/components/Authentication/Authentication.module.css";
import Image from "next/image";

const AudioScreen = ({ shareId }) => {
  const [recording, setRecording] = useState(null);
  const [currentAudio, setCurrentAudio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchShareRecord = async () => {
      if (!shareId) {
        setError("Share ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/sharing/fetch/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shareId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch share details.");
        }

        const data = await response.json();
        setRecording(data.recording);
      } catch (err) {
        setError(err.message || "An error occurred while fetching the share record.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShareRecord();
  }, [shareId]);

  const handlePlay = async () => {
    try {
      const response = await fetch(
        `/api/recordings/play?key=${encodeURIComponent(recording.objectKey)}&_id=${recording._id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audio file.");
      }

      const { fileUrl } = await response.json();
      setCurrentAudio(fileUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching audio file:", error);
    }
  };

  const handleCloseModal = async () => {
    try {
      if (currentAudio) {
        await fetch(`/api/recordings/play?key=${encodeURIComponent(currentAudio)}`, {
          method: "DELETE",
        });
      }
      setCurrentAudio("");
    } catch (error) {
      console.error("Error deleting temporary file:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!recording) {
    return <Typography>No recording found.</Typography>;
  }

  const capitalize = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
            <div className={styles.profileBox}>
              <div className={styles.header}>
                <div className={styles.headerContent}>
                  <h1>Recording Details</h1>
                  <p>Listen to the shared audio file and view its details below.</p>
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
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Agent</strong></TableCell>
                      <TableCell>{capitalize(recording.agent)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell>{new Date(recording.uploadDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Time</strong></TableCell>
                      <TableCell>{recording.callTime}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Duration</strong></TableCell>
                      <TableCell>{recording.duration}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ textAlign: "center" }}>
                <Button variant="contained" color="primary" onClick={handlePlay}>
                  Play Recording
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>

      {/* Modal for Audio Player */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Audio Player</DialogTitle>
        <DialogContent>
          {currentAudio && (
            <audio
              src={currentAudio}
              controls
              autoPlay
              onEnded={handleCloseModal}
              style={{ width: "100%" }}
            >
              Your browser does not support the audio element.
            </audio>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AudioScreen;
