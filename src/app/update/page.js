"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function UpdateRecording() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract query parameters
  const evaluationId = searchParams.get("evaluationId");
  const recordingId = searchParams.get("recordingId");
  const objectKey = searchParams.get("objectKey");
  const account = searchParams.get("account");
  const agent = searchParams.get("agent");
  const date = searchParams.get("date");
  const duration = searchParams.get("duration");

  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const questions = [
    "Did the agent include the correct company name?",
    "Did the agent say their first name?",
    "Did the agent say 'How can I make your day better?'",
    "Did the agent correctly answer questions regarding office hours?",
    "Did the agent confirm the reason for the call?",
    "Did the agent use the correct greeting when closing?",
  ];

  // Fetch existing evaluation data
  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        const checkResponse = await fetch("/api/grading/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordingIds: [recordingId] }),
        });

        if (!checkResponse.ok) throw new Error("Failed to check graded recordings.");
        const { gradedIds } = await checkResponse.json();

        if (!gradedIds.includes(recordingId)) {
          alert("No existing grade found.");
          router.push("/all-evaluations");
          return;
        }

        const evalResponse = await fetch(`/api/grading/fetch-single?id=${evaluationId}`);
        if (!evalResponse.ok) throw new Error("Failed to fetch evaluation details.");
        const data = await evalResponse.json();

        setAnswers(data.answers);
        setFeedback(data.feedback);
      } catch (error) {
        console.error("Error fetching evaluation:", error);
        alert("Error loading evaluation.");
        router.push("/all-evaluations");
      }
    };

    if (evaluationId && recordingId) fetchEvaluationData();
  }, [evaluationId, recordingId, router]);

  // Fetch audio file
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const response = await fetch(`/api/recordings/play?key=${encodeURIComponent(objectKey)}&_id=${recordingId}`);
        if (!response.ok) throw new Error("Failed to fetch recording.");
        const { fileUrl } = await response.json();
        setAudioUrl(fileUrl);
      } catch (error) {
        console.error("Audio fetch error:", error);
      } finally {
        setLoadingAudio(false);
      }
    };

    if (objectKey && recordingId) fetchAudio();
  }, [objectKey, recordingId]);

  const handleAnswerChange = (question, checked) => {
    setAnswers((prev) => ({ ...prev, [question]: checked }));
  };

  const calculateScore = () => {
    const correct = Object.values(answers).filter(Boolean).length;
    return questions.length ? Math.round((correct / questions.length) * 100) : 0;
  };

  const submitGrade = async (score) => {
    setSubmitting(true);

    const payload = {
      evaluationId,
      recordingId,
      agentName: agent,
      answers,
      score,
      feedback,
    };

    try {
      const response = await fetch("/api/grading/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update grade.");
      toast.success("Grade updated successfully!");
      setTimeout(() => router.push("/all-evaluations"), 2000);  // Redirect after 2 seconds
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating grade.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    const score = calculateScore();
    if (score === 0) setConfirmModalOpen(true);
    else submitGrade(score);
  };

  return (
    <Card sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">Update Grade</Typography>
          <Typography><strong>Account:</strong> {account}</Typography>
          <Typography><strong>Agent:</strong> {agent}</Typography>
          <Typography><strong>Date:</strong> {date}</Typography>
          <Typography><strong>Duration:</strong> {duration}</Typography>

          {questions.map((q, i) => (
            <FormControlLabel
              key={i}
              control={<Checkbox checked={answers[q] || false} onChange={(e) => handleAnswerChange(q, e.target.checked)} />}
              label={q}
            />
          ))}

          <TextField
            label="Feedback"
            multiline
            rows={4}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            sx={{ mt: 2 }}
          />
        </Box>

        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {loadingAudio ? (
            <CircularProgress />
          ) : audioUrl ? (
            <audio controls style={{ width: "100%" }}>
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
          ) : (
            <Typography color="error">Audio not available.</Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Updating..." : "Update Grade"}
        </Button>
      </Box>

      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>Submit a failing grade with 0%?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
          <Button onClick={() => submitGrade(0)} autoFocus>Yes, Submit</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}