"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Modal } from "@mui/material";
import { toast } from "react-toastify";

const EditAgentModal = ({ open, onClose, agent, onAgentUpdated }) => {
  const [formData, setFormData] = useState({
    agentName: "",
    agentEmail: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (agent) {
      // Pre-fill form with the selected agent data for editing
      setFormData({
        agentName: agent.agentName || "",
        agentEmail: agent.agentEmail || "",
      });
    }
  }, [agent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (isLoading) return; // Prevent re-entry
    setIsLoading(true);

    try {
      const response = await fetch(`/api/agents/edit?id=${encodeURIComponent(agent._id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Agent updated successfully!");
        onAgentUpdated(); // Refresh agent list on parent component
        onClose(); // Close modal
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update agent.");
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          margin: "auto",
          marginTop: "10%",
          backgroundColor: "white",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" mb={2}>
          Edit Agent
        </Typography>
        <form onSubmit={handleUpdate}>
          <TextField
            label="Agent Name"
            name="agentName"
            fullWidth
            margin="normal"
            value={formData.agentName}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Agent Email"
            name="agentEmail"
            fullWidth
            margin="normal"
            value={formData.agentEmail}
            onChange={handleInputChange}
            required
          />
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
            <Button variant="outlined" color="error" onClick={onClose}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default EditAgentModal;
