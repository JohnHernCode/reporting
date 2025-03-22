"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Chip from "@mui/material/Chip";

export default function Profile() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch("/api/grading/my-grades");
        if (!response.ok) {
          throw new Error("Failed to fetch grades.");
        }

        const data = await response.json();
        setGrades(data.grades);

      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const handlePlay = async (objectKey, _id) => {
    try {
      console.log("Playing audio:", objectKey, _id);

      const response = await fetch(
        `/api/recordings/play?key=${encodeURIComponent(objectKey)}&_id=${_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch audio file");
      }

      const { fileUrl } = await response.json();
      setCurrentAudio(fileUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleCloseModal = async () => {
    try {
      await fetch(`/api/recordings/play?key=${encodeURIComponent(currentAudio)}`, {
        method: "DELETE",
      });

      setCurrentAudio("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting temporary file:", error);
    }
  };

  const handleDispute = async (grade) => {
    console.log("Disputing grade ID:", grade._id); // Debugging Log

    try {
      const response = await fetch("/api/disputes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: grade._id,
          message: "I would like to dispute this grade.",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create dispute");
      }

      alert("Dispute created successfully. Admins will review it.");
    } catch (error) {
      console.error("Error creating dispute:", error);
      alert(error.message);
    }
  };


  return (
    <Box>
      <Box
        sx={{
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
        className="for-dark-bottom-border"
      >
        {/*<Typography component="h1" fontWeight="500" fontSize="18px">*/}
        {/*  Grade Report*/}
        {/*</Typography>*/}

        <Typography fontSize="13px">Review your past evaluations and scores.</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : grades.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Call Date</TableCell>
                <TableCell>Call Time</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Feedback</TableCell> {/* ✅ Add feedback column */}
                {grades.some((grade) => grade.evaluator) && <TableCell>Evaluator</TableCell>}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade._id}>
                  <TableCell>{new Date(grade.callDate).toLocaleDateString()}</TableCell>
                  <TableCell>{grade.callTime}</TableCell>
                  <TableCell>{grade.account}</TableCell>
                  <TableCell>{grade.score}%</TableCell>
                  <TableCell>{grade.feedback}</TableCell> {/* ✅ Display feedback */}
                  {grades.some((grade) => grade.evaluator) && <TableCell>{grade.evaluator}</TableCell>}
                  <TableCell>
                    <Chip
                      label="Play"
                      variant="outlined"
                      color="primary"
                      onClick={() => handlePlay(grade.objectKey, grade._id)}
                     />
                    <Chip label="Dispute" variant="outlined" color="error" onClick={() => handleDispute(grade)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ textAlign: "center", mt: 3 }}>No grades found.</Typography>
      )}

      {/* 🚀 Play Modal */}
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
    </Box>
  );
}
