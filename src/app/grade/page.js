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
import { toast } from "react-toastify";

export default function GradeRecording() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract parameters from query
  const recordingId = searchParams.get("recordingId");
  const objectKey = searchParams.get("objectKey"); // Needed for fetching audio
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
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/account-questions/fetch?accountId=${account}`);
        if (!response.ok) throw new Error("Failed to fetch questions.");

        const data = await response.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        // Fallback to default questions if fetch fails
        setQuestions([
          "Default Did the agent include the correct company name?",
          "Did the agent say their first name?",
          "Did the agent say 'How can I make your day better?'",
          "Did the agent correctly answer questions regarding office hours?",
          "Did the agent confirm the reason for the call?",
          "Did the agent use the correct greeting when closing?",
        ]);
      }
    };

    if (account) fetchQuestions();
  }, [account]);

  // Fetch audio file when component loads
  useEffect(() => {
    async function fetchAudio() {
      console.log("Fetching audio");
      try {
        const response = await fetch(
          `/api/recordings/play?key=${encodeURIComponent(objectKey)}&_id=${recordingId}`
        );
        if (!response.ok) throw new Error("Failed to fetch recording.");


        const { fileUrl } = await response.json();
        console.log("Received file URL:", fileUrl);

        setAudioUrl(fileUrl);
      } catch (error) {
        console.error("Error fetching audio:", error);
      } finally {
        setLoadingAudio(false);
      }
    }

    if (objectKey && recordingId) fetchAudio();
  }, [objectKey, recordingId]);

  // Handle deleting the temporary file
  const deleteAudioFile = async () => {
    try {
      if (audioUrl) {
        await fetch(`/api/recordings/play?key=${encodeURIComponent(audioUrl)}`, { method: "DELETE" });
      }
    } catch (error) {
      console.error("Error deleting temporary file:", error);
    }
  };

  const handleAnswerChange = (question, checked) => {
    setAnswers((prev) => ({ ...prev, [question]: checked }));
  };

  // ✅ Ensures score defaults to 0 if no answers are checked
  const calculateScore = () => {
    const totalQuestions = questions.length;
    const correctAnswers = Object.values(answers).filter(Boolean).length;
    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  };

  // 🚀 Handle form submission
  const handleSubmit = async () => {
    const score = calculateScore();

    if (score === 0) {
      setConfirmModalOpen(true);
      return; // Don't submit yet, wait for confirmation
    }

    await submitGrade(score);
  };

  // 🚀 Final submission after confirmation
  const submitGrade = async (score) => {
    setSubmitting(true);
    setConfirmModalOpen(false);

    const payload = {
      recordingId,
      agentName: agent,
      answers,
      score,
      feedback,
    };

    try {
      const response = await fetch("/api/grading/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // ✅ Parse response JSON before using it
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(data.message); // ✅ This will now work
        } else {
          // toast.error("Error submitting grade.");
          toast.error(data.message);
        }
        throw new Error(data.message);
      }

      // ✅ Delete the temporary audio file after grading
      await deleteAudioFile();

      toast.success("Grade submitted successfully!"); // ✅ Success toast
      router.push("/recording-data");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Card sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Flex container for Data and Player */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Left Column - Recording Details and Questions */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">Grading for Recording</Typography>
          <Typography><strong>Account:</strong> {account}</Typography>
          <Typography><strong>Agent:</strong> {agent}</Typography>
          <Typography><strong>Date:</strong> {date}</Typography>
          <Typography><strong>Duration:</strong> {duration}</Typography>

          <Box sx={{ mt: 2 }}>
            {questions.map((q, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={answers[q] || false}
                    onChange={(e) => handleAnswerChange(q, e.target.checked)}
                  />
                }
                label={q}
              />
            ))}
          </Box>

          {/* Feedback Box */}
          <TextField
            label="Feedback"
            multiline
            rows={4}
            fullWidth
            sx={{ mt: 2 }}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </Box>

        {/* Right Column - Audio Player */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="h6" sx={{ textAlign: "center", mb: 1 }}>Audio Playback</Typography>
          {loadingAudio ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : audioUrl ? (
            <audio controls style={{ width: "100%" }}>
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <Typography color="error" sx={{ textAlign: "center" }}>
              Audio not available.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Submit Button - Positioned at Far Right */}
      <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-end" }, mt: 2 }}>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Grade"}
        </Button>
      </Box>



      {/* 🚀 Confirmation Modal for 0 Score */}
      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            No criteria were marked. Are you sure you want to submit a failing grade?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => submitGrade(0)} color="primary" autoFocus>
            Yes, Submit
          </Button>
        </DialogActions>
      </Dialog>

    </Card>
  );
}
