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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {toast} from "react-toastify";

const capitalize = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function AllEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState(null);
  // Filters
  const [accountFilter, setAccountFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  // Unique values for dropdowns
  const [uniqueAccounts, setUniqueAccounts] = useState([]);
  const [uniqueAgents, setUniqueAgents] = useState([]);
  const [uniqueScores, setUniqueScores] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await fetch("/api/grading/fetch-all");
        if (!response.ok) throw new Error("Failed to fetch evaluations.");

        const data = await response.json();
        console.log("API Response:", data);

        const { evaluations, userRole } = data;
        if (!Array.isArray(evaluations)) throw new Error("Invalid evaluations data.");

        const formattedEvaluations = evaluations.map((ev) => ({
          ...ev,
          agent: ev.agent ? capitalize(ev.agent) : "Unknown",
          evaluator: ev.evaluator ? capitalize(ev.evaluator) : "Unknown",
          account: ev.account ? capitalize(ev.account) : "Unknown",
          qaFeedback: ev.qaFeedback || "N/A",
          isConfirmed: ev.isConfirmed || false,
        }));

        setEvaluations(formattedEvaluations);
        setFilteredEvaluations(formattedEvaluations);
        setUserRole(userRole);

        // Extract unique values for dropdowns
        const accounts = Array.from(new Set(formattedEvaluations.map((ev) => ev.account)));
        const agents = Array.from(new Set(formattedEvaluations.map((ev) => ev.agent)));
        const scores = Array.from(new Set(formattedEvaluations.map((ev) => ev.score)));

        setUniqueAccounts(accounts);
        setUniqueAgents(agents);
        setUniqueScores(scores.sort((a, b) => a - b)); // Sort scores numerically

      } catch (error) {
        console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  const handlePlay = async (objectKey, _id) => {
    try {
      const response = await fetch(`/api/recordings/play?key=${encodeURIComponent(objectKey)}&_id=${_id}`);
      if (!response.ok) throw new Error("Failed to fetch audio file.");

      const { fileUrl } = await response.json();
      setCurrentAudio(fileUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleCloseModal = async () => {
    try {
      await fetch(`/api/recordings/play?key=${encodeURIComponent(currentAudio)}`, { method: "DELETE" });
      setCurrentAudio("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting temp file:", error);
    }
  };

  const handleUpdateGrade = (evaluation) => {
    if (evaluation.isGraded && !["Admin", "Management"].includes(userRole)) {
      alert("Only Admins or Managers can update an already graded evaluation.");
      return;
    }
    router.push(
      `/update/?evaluationId=${evaluation.evaluationId}&recordingId=${evaluation.recordingId}&objectKey=${encodeURIComponent(evaluation.objectKey)}&account=${evaluation.account}&agent=${evaluation.agent}&date=${evaluation.callDate}&duration=${evaluation.callTime}`
    );
  };

  const handleViewAnswers = (answers) => {
    setSelectedAnswers(answers);
    setIsAnswersModalOpen(true);
  };

  const getScoreChipColor = (score) => {
    if (score < 90) return "error";
    if (score >= 90 && score <= 95) return "warning";
    if (score > 95) return "success";
    return "default";
  };

  const applyFilters = () => {
    const filtered = evaluations.filter((ev) => {
      const dateMatch = dayjs(ev.callDate).isBetween(startDate, endDate, null, "[]");
      const accountMatch = accountFilter ? ev.account === accountFilter : true;
      const agentMatch = agentFilter ? ev.agent === agentFilter : true;
      const scoreMatch = scoreFilter ? ev.score.toString() === scoreFilter : true;
      return dateMatch && accountMatch && agentMatch && scoreMatch;
    });
    setFilteredEvaluations(filtered);
  };

  const resetFilters = () => {
    setAccountFilter("");
    setAgentFilter("");
    setScoreFilter("");
    setStartDate(dayjs().subtract(30, "day"));
    setEndDate(dayjs());
    setFilteredEvaluations(evaluations);
  };

  const handleConfirmEvaluation = async (evaluation) => {
    if (!["Admin", "Management"].includes(userRole)) return;

    try {
      const response = await fetch("/api/grading/confirm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeId: evaluation.evaluationId }),
      });

      if (!response.ok) throw new Error("Failed to confirm evaluation.");
      toast.success("Evaluation confirmed successfully!");

      // Refresh data to show updated status
      setEvaluations((prev) =>
        prev.map((ev) => (ev.evaluationId === evaluation.evaluationId ? { ...ev, isConfirmed: true } : ev))
      );
    } catch (error) {
      console.error("Confirm error:", error);
      toast.error("Error confirming evaluation.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          All Evaluations
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <DatePicker label="Start Date" value={startDate} onChange={setStartDate} />
          <DatePicker label="End Date" value={endDate} onChange={setEndDate} />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Account</InputLabel>
            <Select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              label="Account"
            >
              <MenuItem value="">All Accounts</MenuItem>
              {uniqueAccounts.map((account, index) => (
                <MenuItem key={index} value={account}>
                  {account}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Agent</InputLabel>
            <Select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              label="Agent"
            >
              <MenuItem value="">All Agents</MenuItem>
              {uniqueAgents.map((agent, index) => (
                <MenuItem key={index} value={agent}>
                  {agent}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Score</InputLabel>
            <Select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              label="Score"
            >
              <MenuItem value="">All Scores</MenuItem>
              {uniqueScores.map((score, index) => (
                <MenuItem key={index} value={score.toString()}>
                  {score}%
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button variant="outlined" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredEvaluations.length === 0 ? (
          <Typography>No evaluations found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Call Date</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Call Time</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>QA Feedback</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Evaluator</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvaluations.map((evaluation) => (
                  <TableRow key={evaluation._id}>
                    <TableCell>{new Date(evaluation.callDate).toLocaleDateString()}</TableCell>
                    <TableCell>{evaluation.account}</TableCell>
                    <TableCell>{evaluation.callTime || "N/A"}</TableCell>
                    <TableCell>{evaluation.agent}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${evaluation.score}%`}
                        variant="outlined"
                        color={getScoreChipColor(evaluation.score)}
                        onClick={() => handleViewAnswers(evaluation.answers)}
                      />
                    </TableCell>
                    <TableCell>{evaluation.qaFeedback || "N/A"}</TableCell>
                    <TableCell>{evaluation.feedback || "No feedback provided"}</TableCell>
                    <TableCell>{evaluation.evaluator}</TableCell>
                    <TableCell>
                      <Chip
                        label="Play"
                        variant="outlined"
                        color="primary"
                        onClick={() => handlePlay(evaluation.objectKey, evaluation._id)}
                        sx={{ mr: 1 }}
                      />
                      {!evaluation.isConfirmed && (
                        <Chip
                          label="Update Grade"
                          variant="outlined"
                          color={evaluation.isGraded && !["Admin", "Management"].includes(userRole) ? "default" : "primary"}
                          onClick={() => handleUpdateGrade(evaluation)}
                          disabled={evaluation.isGraded && !["Admin", "Management"].includes(userRole)}
                        />
                      )}
                      {evaluation.isConfirmed ? (
                        <Chip label="Confirmed" variant="outlined" color="success" />
                      ) : (
                        ["Admin", "Management"].includes(userRole) && (
                          <Chip
                            label="Confirm QA Result"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleConfirmEvaluation(evaluation)}
                          >
                            Confirm
                          </Chip>
                        )
                      )}
                      {evaluation.dispute && (
                        <Chip
                          label="View Dispute"
                          variant="outlined"
                          color="error"
                          onClick={() => router.push("/disputes/")}
                          sx={{ mr: 1 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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
            <Button onClick={handleCloseModal} color="secondary">Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isAnswersModalOpen} onClose={() => setIsAnswersModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Evaluation Answers</DialogTitle>
          <DialogContent>
            {selectedAnswers ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Object.entries(selectedAnswers).map(([question, answer], index) => (
                  <Typography key={index} sx={{ mb: 1 }}>
                    <strong>{question}</strong>: {answer ? "✅ Yes" : "❌ No"}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography>No answers available.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAnswersModalOpen(false)} color="secondary">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
