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
} from "@mui/material";
import PageTitle from "@/components/Common/PageTitle";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ArchivedAgentsPage() {
  const [archivedAgents, setArchivedAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchivedAgents = async () => {
      try {
        const response = await fetch("/api/agents/archived");
        const data = await response.json();
        setArchivedAgents(data.agents); // Set archived agents
      } catch (error) {
        console.error("Error fetching archived agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedAgents();
  }, []);

  const handleRestore = async (agentId) => {
    try {
      const response = await fetch("/api/agents/restore", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentId }),
      });

      if (response.ok) {
        toast.success("Agent restored successfully.");
        // Remove the restored agent from the list
        setArchivedAgents((prevAgents) =>
          prevAgents.filter((agent) => agent._id !== agentId)
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to restore agent.");
      }
    } catch (error) {
      console.error("Error restoring agent:", error);
      toast.error("An error occurred while restoring the agent.");
    }
  };

  if (loading) {
    return (
      <Box>
        <PageTitle title="Archived Agents" />
        <Typography variant="h6" sx={{ textAlign: "center", marginTop: "20px" }}>
          Loading archived agents...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageTitle title="Archived Agents" />
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
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {archivedAgents.map((agent) => (
              <TableRow key={agent._id}>
                <TableCell>{agent.agentName}</TableCell>
                <TableCell>{agent.agentEmail}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRestore(agent._id)}
                  >
                    Restore
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
