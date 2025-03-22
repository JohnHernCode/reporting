"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Modal } from "@mui/material";
import { toast } from "react-toastify";

const EditAccountModal = ({ open, onClose, account, onAccountUpdated }) => {
  const [formData, setFormData] = useState({
    accountName: "",
    dnis: "",
    testingNumber: "", // Add testingNumber to the form state
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account) {
      // Pre-fill form with the selected account data for editing
      setFormData({
        accountName: account.accountName || "",
        dnis: account.dnis || "",
        testingNumber: account.testingNumber || "", // Populate testingNumber if it exists
      });
    }
  }, [account]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (isLoading) return; // Prevent re-entry
    setIsLoading(true);

    try {
      const response = await fetch(`/api/accounts/edit?id=${encodeURIComponent(account._id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Account updated successfully!");
        onAccountUpdated(); // Refresh account list on parent component
        onClose(); // Close modal
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update account.");
      }
    } catch (error) {
      console.error("Error updating account:", error);
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
          Edit Account
        </Typography>
        <form onSubmit={handleUpdate}>
          <TextField
            label="Account Name"
            name="accountName"
            fullWidth
            margin="normal"
            value={formData.accountName}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="DNIS"
            name="dnis"
            fullWidth
            margin="normal"
            value={formData.dnis}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Testing Number"
            name="testingNumber"
            fullWidth
            margin="normal"
            value={formData.testingNumber}
            onChange={handleInputChange}
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

export default EditAccountModal;
