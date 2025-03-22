"use client";

import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function DisputeList() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // "All", "Open", "Resolved"
  const router = useRouter();

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const response = await fetch("/api/disputes/fetch-all");
        if (!response.ok) throw new Error("Failed to fetch disputes.");
        const data = await response.json();

        // ✅ Make sure the frontend always uses `agentName`
        const normalizedDisputes = data.disputes.map((dispute) => ({
          ...dispute,
          agentName: dispute.agentName || dispute.agentUsername || "Unknown Agent",
        }));

        setDisputes(normalizedDisputes);
      } catch (error) {
        console.error("Error fetching disputes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const handleFilterChange = (status) => {
    setFilter((prev) => (prev === status ? "All" : status)); // Toggle filter
  };

  const filteredDisputes = disputes.filter((dispute) =>
    filter === "All" ? true : dispute.status === filter
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Dispute Cases
      </Typography>

      {/* 🔎 Filter Chips */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip
          label="Open"
          color={filter === "Open" ? "primary" : "default"}
          variant={filter === "Open" ? "filled" : "outlined"}
          onClick={() => handleFilterChange("Open")}
        />
        <Chip
          label="Resolved"
          color={filter === "Resolved" ? "primary" : "default"}
          variant={filter === "Resolved" ? "filled" : "outlined"}
          onClick={() => handleFilterChange("Resolved")}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : filteredDisputes.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDisputes.map((dispute) => (
                <TableRow key={dispute.caseId}>
                  <TableCell>{dispute.agentName}</TableCell>
                  <TableCell>
                    <Chip
                      label={dispute.status}
                      color={dispute.status === "Resolved" ? "success" : "warning"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/disputes/${dispute.caseId}`)}
                    >
                      Open Chat
                    </Button>

                    {/* 🆕 New "Chat with QA" Button */}
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => router.push(`/qa-chat/${dispute.caseId}`)}
                    >
                      Chat with QA
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ textAlign: "center", mt: 3 }}>
          No {filter !== "All" ? filter.toLowerCase() : ""} disputes found.
        </Typography>
      )}
    </Box>
  );
}
