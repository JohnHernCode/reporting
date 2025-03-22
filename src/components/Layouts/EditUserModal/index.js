"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";

const roles = ["Admin", "Management", "QA", "Agent"];

const EditUserModal = ({ open, onClose, user, onUpdate }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [role, setRole] = useState("Agent");
  const [team, setTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setRole(user.role || "Agent");
      setTeam(user.team || "");
      setPassword("");
      setVerifyPassword("");
      setError("");
    }

    // Fetch available teams
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
  }, [user]);

  const handleUpdate = () => {
    if (password && password !== verifyPassword) {
      setError("Passwords do not match.");
      return;
    }

    const updatedFields = { username, email, role };
    if (password) updatedFields.password = password;
    if (role === "Agent") updatedFields.team = newTeam || team;

    if (Object.keys(updatedFields).length === 0) {
      setError("No changes detected.");
      return;
    }

    onUpdate(user._id, updatedFields);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 400, margin: "auto", marginTop: "10%", backgroundColor: "white", borderRadius: 2, p: 4 }}>
        <Typography variant="h6">Edit User: {user.username}</Typography>

        <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />

        {/* Role Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Team Selection (Only for Agents) */}
        {role === "Agent" && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Team</InputLabel>
              <Select value={team} onChange={(e) => setTeam(e.target.value)}>
                {teams.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Or Create New Team" fullWidth margin="normal" value={newTeam} onChange={(e) => setNewTeam(e.target.value)} />
          </>
        )}

        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <TextField label="Verify Password" type="password" fullWidth margin="normal" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} />

        {error && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{error}</Typography>}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ textTransform: "capitalize" }}>
            Update
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditUserModal;