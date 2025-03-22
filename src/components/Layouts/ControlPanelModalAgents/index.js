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

export default function ControlPanelModalAgents({ onAgentCreated }) {
  const [isActiveSearchModal, setActiveSearchModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    agentName: "",
    agentEmail: "",
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
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/agents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Agent created successfully!", { autoClose: 3000 });
        setFormData({ agentName: "", agentEmail: "" });
        onAgentCreated?.();
      } else {
        toast.error(data.message || "Failed to create agent", { autoClose: 3000 });
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

    Papa.parse(file, {
      header: true,
      complete: async ({ data }) => {
        const validAgents = data.filter(row => row.agentName && row.agentEmail);
        let successCount = 0;

        for (const row of validAgents) {
          try {
            const response = await fetch("/api/agents/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                agentName: row.agentName,
                agentEmail: row.agentEmail,
              }),
            });

            if (response.ok) successCount++;
          } catch (err) {
            console.error("CSV Import Error:", err);
          }
        }

        toast.success(`CSV Import complete. ${successCount} agents created.`);
        onAgentCreated?.();
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
        toast.error("Failed to parse CSV file.");
      },
    });
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
                Create Agent
              </Typography>
            </Toolbar>
          </AppBar>

          <Box p={3} className="control-panel-content">
            <form onSubmit={handleSubmit}>
              <TextField
                label="Agent Name"
                name="agentName"
                fullWidth
                margin="normal"
                required
                value={formData.agentName}
                onChange={handleInputChange}
              />
              <TextField
                label="Agent Email"
                name="agentEmail"
                fullWidth
                margin="normal"
                required
                value={formData.agentEmail}
                onChange={handleInputChange}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2, textTransform: "capitalize" }}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Create Agent"}
              </Button>
            </form>

            <Box mt={4}>
              <Typography variant="h6">Import Agents via CSV</Typography>
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
