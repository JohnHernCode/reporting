"use client";

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const roles = ["Admin", "Management", "QA", "Agent"];

export default function ControlPanelModal({ selectedUser, onUserUpdated }) {
  const [isActiveSearchModal, setActiveSearchModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    role: "Agent",
    team: "",
  });

  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState("");
  const isEditMode = !!selectedUser;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        username: selectedUser.username || "",
        password: "",
        email: selectedUser.email || "",
        role: selectedUser.role || "Agent",
        team: selectedUser.team || "",
      });
    } else {
      setFormData({
        username: "",
        password: "",
        email: "",
        role: "Agent",
        team: "",
      });
    }

    // Fetch teams
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/teams/fetch");
        const data = await res.json();
        setTeams(data.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, [selectedUser]);

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
      const endpoint = selectedUser
        ? `/api/users/edit?id=${selectedUser._id}`
        : "/api/users/create";

      const payload = {
        ...formData,
        team: formData.role === "Agent" ? newTeam || formData.team : null,
      };

      const response = await fetch(endpoint, {
        method: selectedUser ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(selectedUser ? "User updated successfully!" : "User created successfully!", { autoClose: 3000 });
        setFormData({ username: "", password: "", email: "", role: "Agent", team: "" });
        onUserUpdated();
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

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="dark" />
      <div className={`control-panel-modal ${isActiveSearchModal ? "show" : ""}`}>
        <Tooltip title="Control Panel" placement="left" arrow>
          <div className="settings-btn" onClick={handleToggleSearchModal}>
            <i className="ri-settings-3-line"></i>
          </div>
        </Tooltip>

        <div className="control-panel-dialog">
          <AppBar sx={{ position: "relative" }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleToggleSearchModal} aria-label="close">
                <CloseIcon sx={{ color: "#fff !important" }} />
              </IconButton>
              <Typography sx={{ flex: 1, color: "#fff !important" }} variant="h6" component="div" className="ml-2">
                {isEditMode ? "Edit User" : "Create User"}
              </Typography>
            </Toolbar>
          </AppBar>

          <Box p={3} className="control-panel-content">
            {/* User Form */}
            <form onSubmit={handleSubmit}>
              {!isEditMode && (
                <TextField label="Username" name="username" fullWidth margin="normal" required value={formData.username} onChange={handleInputChange} />
              )}
              <TextField label="Password" name="password" type="password" fullWidth margin="normal" required value={formData.password} onChange={handleInputChange} />
              {!isEditMode && (
                <TextField label="Email" name="email" type="email" fullWidth margin="normal" required value={formData.email} onChange={handleInputChange} />
              )}

              {/* Role Selection */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  MenuProps={{
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                    getContentAnchorEl: null,
                    sx: { zIndex: 999999 },
                    container: document.body,
                  }}
                >
                  {roles.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>



              {/* Team Selection (Only for Agents) */}
              {formData.role === "Agent" && (
                <>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Team</InputLabel>
                    <Select
                      name="team"
                      value={formData.team}
                      onChange={handleInputChange}
                      MenuProps={{
                        anchorOrigin: { vertical: "bottom", horizontal: "left" },
                        transformOrigin: { vertical: "top", horizontal: "left" },
                        getContentAnchorEl: null,
                        sx: { zIndex: 999999 },
                        container: document.body,
                      }}
                    >
                      {teams.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>


                  <TextField label="Or Create New Team" fullWidth margin="normal" value={newTeam} onChange={(e) => setNewTeam(e.target.value)} />
                </>
              )}

              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, textTransform: "capitalize" }} disabled={isLoading}>
                {isLoading ? "Processing..." : isEditMode ? "Update User" : "Create User"}
              </Button>
            </form>
          </Box>

          <div className="control-panel-footer">
            <Button onClick={handleToggleSearchModal} variant="contained" color="error" sx={{ textTransform: "capitalize", color: "#fff !important" }}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
