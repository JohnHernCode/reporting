"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { toast } from "react-toastify";

export default function ManageQuestionsModal({ open, onClose, account }) {
  const [questions, setQuestions] = useState(["", "", "", "", ""]);

  // Load existing questions if they exist
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!account) return;
      try {
        const response = await fetch(`/api/account-questions/fetch?accountId=${account._id}`);
        const data = await response.json();
        if (data.questions) {
          setQuestions(data.questions.concat(["", "", "", "", ""])); // Existing questions + 5 empty inputs
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [account]);

  const handleAddMoreQuestions = () => {
    setQuestions((prev) => [...prev, "", "", "", "", ""]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    const filteredQuestions = questions.filter((q) => q.trim() !== "");

    if (filteredQuestions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }

    try {
      const response = await fetch("/api/account-questions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: account._id,
          accountName: account.accountName,
          questions: filteredQuestions,
          isDefault: false
        }),
      });

      if (response.ok) {
        toast.success("Questions updated successfully!");
        onClose(); // Close modal
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update questions.");
      }
    } catch (error) {
      console.error("Error submitting questions:", error);
      toast.error("An error occurred while updating questions.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Questions for {account?.accountName}</DialogTitle>
      <DialogContent dividers>
        {questions.map((question, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <TextField
              fullWidth
              label={`Question ${index + 1}`}
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              sx={{ mr: 2 }}
            />
            <IconButton
              onClick={() => handleRemoveQuestion(index)}
              color="error"
              disabled={questions.length <= 5}
            >
              <RemoveIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddMoreQuestions}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Add More Questions
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={questions.filter((q) => q.trim() !== "").length === 0}
        >
          Save Questions
        </Button>
      </DialogActions>
    </Dialog>
  );
}
