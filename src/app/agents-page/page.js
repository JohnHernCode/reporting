"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import PageTitle from "@/components/Common/PageTitle";
import EditAgentModal from "@/components/Layouts/EditAgentModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [agentToArchive, setAgentToArchive] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents/fetch");
        const data = await response.json();
        // Exclude archived agents
        const activeAgents = data.agents.filter((agent) => !agent.archived);
        setAgents(activeAgents);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    fetchAgents();
  }, []);

  const handleEditClick = (agent) => {
    setSelectedAgent(agent);
    setIsEditModalOpen(true);
  };

  const handleArchiveClick = (agentId) => {
    setAgentToArchive(agentId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!agentToArchive) return;

    try {
      const response = await fetch(`/api/agents/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentToArchive }),
      });

      if (response.ok) {
        toast.success("Agent archived successfully.");
        setAgents((prevAgents) =>
          prevAgents.filter((agent) => agent._id !== agentToArchive)
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to archive agent.");
      }
    } catch (error) {
      console.error("Error archiving agent:", error);
      toast.error("An error occurred while archiving the agent.");
    } finally {
      setAgentToArchive(null);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleCancelArchive = () => {
    setAgentToArchive(null);
    setIsConfirmDialogOpen(false);
  };

  return (
    <Box>
      <PageTitle title="Agents List" />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Agent Name</strong></TableCell>
              <TableCell><strong>Agent Email</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent._id}>
                <TableCell>{agent.agentName}</TableCell>
                <TableCell>{agent.agentEmail}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(agent)}
                    sx={{ marginRight: "8px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleArchiveClick(agent._id)}
                  >
                    Archive
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditAgentModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        agent={selectedAgent}
        onAgentUpdated={() => {
          const fetchAgents = async () => {
            try {
              const response = await fetch("/api/agents/fetch");
              const data = await response.json();
              const activeAgents = data.agents.filter((agent) => !agent.archived);
              setAgents(activeAgents);
            } catch (error) {
              console.error("Error fetching agents:", error);
            }
          };
          fetchAgents();
        }}
      />

      <Dialog
        open={isConfirmDialogOpen}
        onClose={handleCancelArchive}
      >
        <DialogTitle>Confirm Archiving</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to archive this agent?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelArchive} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmArchive} color="error" variant="contained">
            Archive
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
