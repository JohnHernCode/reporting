"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Modal,
  TextField
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UnregisteredUsersPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({ agentName: "", agentEmail: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [existingAgent, setExistingAgent] = useState(null); // Holds agent data if email already exists
  const [showConflictOptions, setShowConflictOptions] = useState(false); // Tracks modal state

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/unregistered-agents");
      if (!res.ok) throw new Error("Failed to fetch unregistered users");
      const data = await res.json();
      setAgents(data.sort((a, b) => a.fullName.localeCompare(b.fullName)));
    } catch (error) {
      console.error("Error fetching unregistered users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const capitalizeFullName = (name) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleOpenModal = (agent) => {
    const formattedName = capitalizeFullName(agent.fullName);
    setSelectedAgent(agent);
    setFormData({ agentName: formattedName, agentEmail: "" });
    setShowConflictOptions(false); // Reset conflict modal state
    setExistingAgent(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setTimeout(() => {
      setOpenModal(false);
      setSelectedAgent(null);
      setFormData({ agentName: "", agentEmail: "" });
      setShowConflictOptions(false);
      setExistingAgent(null);
      fetchAgents().then()
    }, 300); // Delay to let Toastify render
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    if (!formData.agentEmail.trim()) {
      toast.error("Agent email is required.");
      setIsLoading(false);
      return;
    }

    console.log("📤 Sending create request:", formData);

    try {
      const response = await fetch("/api/agents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // ✅ Remove agent from unregistered list
        await removeUnregisteredAgent(formData.agentName);
        toast.success("Agent has been registered successfully.");
        handleCloseModal();
      } else if (response.status === 409) {
        // 🚨 Handle Email Conflict: Store the Existing Agent
        const errData = await response.json();
        console.log("⚠️ Conflict detected, existing agent:", errData.agent || "UNKNOWN");

        setExistingAgent({
          agentName: formData.agentName,  // 🔥 Ensure fallback name
          agentEmail: formData.agentEmail // 🔥 Ensure fallback email
        });

        setShowConflictOptions(true); // 🔥 Show conflict modal
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Something went wrong creating the agent.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const removeUnregisteredAgent = async (name) => {
    const deleteRes = await fetch("/api/unregistered-agents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: name }),
    });

    if (!deleteRes.ok) {
      toast.warn("Agent created but failed to remove from unregistered list.");
    } else {
      setAgents((prev) => prev.filter((a) => a.fullName !== name));
    }
  };

  const handleUpdateAgent = async () => {
    if (!existingAgent) {
      console.error("❌ No existing agent found!");
      toast.error("Something went wrong. No existing agent found.");
      return;
    }

    console.log("🔄 Updating agent:", existingAgent.agentEmail, "to", formData.agentName); // Debugging log

    try {
      const response = await fetch("/api/agents/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentEmail: existingAgent.agentEmail, // Find by email
          newName: formData.agentName, // Update to this name
        }),
      });

      const result = await response.json(); // Capture API response
      console.log("✅ Update response:", response.status, result); // Debugging log

      if (response.ok) {
        toast.success("🎉 Agent name updated successfully!");
        setAgents((prev) => prev.filter((a) => a.fullName !== formData.agentName));
        await removeUnregisteredAgent(formData.agentName);
        handleCloseModal();
      } else {
        toast.error(result.message || "❌ Failed to update agent name.");
      }
    } catch (error) {
      console.error("⚠️ Error updating agent:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const isEmailValid = (email) => {
    return /\S+@\S+\.\S+/.test(email); // simple regex
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} containerId="main-toast" />
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Unregistered Agents
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : agents.length === 0 ? (
        <Typography>No unregistered agents found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Agent Name</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.fullName}>
                  <TableCell>{agent.fullName}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenModal(agent)}
                    >
                      Register
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            minWidth: 300,
          }}
        >
          {!showConflictOptions ? (
            <>
              <Typography variant="h6" mb={2}>Register Agent</Typography>
              <form onSubmit={handleCreate}>
                <TextField
                  label="Agent Name"
                  fullWidth
                  margin="normal"
                  value={formData.agentName}
                  InputProps={{ readOnly: true }}
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
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={isLoading || !isEmailValid(formData.agentEmail)}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Typography variant="h6" mb={2}>Email Already Exists</Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  console.log("🛑 Conflict button clicked! Calling handleUpdateAgent()");
                  handleUpdateAgent().then();
                }}
              >
                Update Existing Agent's Name
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  console.log("🛑 User chose to enter a different email");
                  setShowConflictOptions(false);
                }}
              >
                Enter a Different Email
              </Button>
            </>
          )}
        </Box>
      </Modal>

    </Box>
    </>
  );
}
