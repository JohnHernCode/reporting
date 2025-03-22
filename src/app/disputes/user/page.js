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
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function UserDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDisputes = async () => {
      try {
        const response = await fetch("/api/disputes/user");
        if (!response.ok) throw new Error("Failed to fetch disputes.");

        const data = await response.json();
        setDisputes(data.disputes);
      } catch (error) {
        console.error("Error fetching user disputes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDisputes();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Open Disputes
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : disputes.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dispute ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disputes.map((dispute) => (
                <TableRow key={dispute._id}>
                  <TableCell>{dispute._id}</TableCell>
                  <TableCell>{dispute.status}</TableCell>
                  <TableCell>{new Date(dispute.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => router.push(`/disputes/${dispute._id}`)}>
                      View Chat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography sx={{ textAlign: "center", mt: 3 }}>No open disputes found.</Typography>
      )}
    </Box>
  );
}
