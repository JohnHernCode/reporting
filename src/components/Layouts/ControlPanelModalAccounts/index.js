"use client";

import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { Box, TextField, Button } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";

export default function ControlPanelModalAccounts({ onAccountCreated }) {
  const [isActiveSearchModal, setActiveSearchModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    accountName: "",
    dnis: "",
    testingNumber: "", // Add testingNumber to form data
  });

  const handleToggleSearchModal = () => {
    setActiveSearchModal(!isActiveSearchModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return; // Prevent re-entry
    setIsLoading(true);

    try {
      const response = await fetch("/api/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Account created successfully!", { autoClose: 3000 });

        // Reset the form data after successful creation
        setFormData({ accountName: "", dnis: "", testingNumber: "" });

        if (typeof onAccountCreated === "function") {
          onAccountCreated(); // Notify parent to refresh the account list
        }
      } else {
        const data = await response.json();
        toast.error(data.message || "Something went wrong.", { autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.", { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "text/csv") {
      toast.error("Please upload a valid CSV file.");
      return;
    }

    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const accounts = results.data.filter((row) => row.dnis && row.accountName);

          if (accounts.length === 0) {
            toast.error("CSV file is empty or incorrectly formatted.");
            return;
          }

          const response = await fetch("/api/accounts/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accounts }),
          });

          if (response.ok) {
            toast.success("Accounts imported successfully!");

            if (typeof onAccountCreated === "function") {
              onAccountCreated(); // Notify parent to refresh the account list
            }
          } else {
            const errorData = await response.json();
            toast.error(errorData.message || "Failed to import accounts.");
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          toast.error("Failed to parse CSV file.");
        },
      });
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("An error occurred during upload.");
    }
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        toastClassName="custom-toast"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      <div className={`control-panel-modal ${isActiveSearchModal ? "show" : ""}`}>
        <Tooltip title="Control Panel" placement="left" arrow>
          <div className="settings-btn" onClick={handleToggleSearchModal}>
            <i className="ri-settings-3-line"></i>
          </div>
        </Tooltip>

        <div className="control-panel-dialog">
          <AppBar sx={{ position: "relative" }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleToggleSearchModal}
                aria-label="close"
              >
                <CloseIcon sx={{ color: "#fff !important" }} />
              </IconButton>
              <Typography
                sx={{ flex: 1, color: "#fff !important" }}
                variant="h6"
                component="div"
                className="ml-2"
              >
                Create Account
              </Typography>
            </Toolbar>
          </AppBar>

          <Box p={3} className="control-panel-content">
            <form onSubmit={handleSubmit}>
              <TextField
                label="Account Name"
                name="accountName"
                fullWidth
                margin="normal"
                required
                value={formData.accountName}
                onChange={handleInputChange}
              />
              <TextField
                label="DNIS"
                name="dnis"
                fullWidth
                margin="normal"
                required
                value={formData.dnis}
                onChange={handleInputChange}
              />
              <TextField
                label="Testing Number"
                name="testingNumber"
                fullWidth
                margin="normal"
                value={formData.testingNumber}
                onChange={handleInputChange}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2, textTransform: "capitalize" }}
                disabled={isLoading} // Disable when loading
              >
                {isLoading ? "Processing..." : "Create Account"}
              </Button>
            </form>

            <Box mt={4}>
              <Typography variant="h6">Import Accounts via CSV</Typography>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                style={{ marginTop: "8px" }}
              />
            </Box>
          </Box>

          <div className="control-panel-footer">
            <Button
              onClick={handleToggleSearchModal}
              variant="contained"
              color="error"
              sx={{ textTransform: "capitalize", color: "#fff !important" }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
