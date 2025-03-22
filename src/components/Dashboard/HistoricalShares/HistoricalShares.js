"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import PageTitle from "@/components/Common/PageTitle";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HistoricalShares() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const response = await fetch("/api/sharing/fetch");
      if (!response.ok) {
        throw new Error("Failed to fetch historical shares.");
      }
      const data = await response.json();
      setShares(data.shares || []);
    } catch (error) {
      console.error("Error fetching shares:", error);
      toast.error("Error loading historical shares.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (shareId, email) => {
    try {
      const response = await fetch("/api/sharing/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId, email }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to resend email.");
      }

      toast.success("Email resent successfully!");
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error(error.message);
    }
  };


  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => setRowsPerPage(parseInt(event.target.value, 10));

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer position="top-center" autoClose={3000} />
      <PageTitle pageTitle="Historical Shares" dashboardUrl="/" dashboardText="Home" />

      <Card sx={{ boxShadow: "none", borderRadius: "10px", p: "25px", mb: "15px" }}>
        <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
          Shared Recordings
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading historical shares...</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Recipient Email</TableCell>
                  <TableCell>Shared By</TableCell>
                  <TableCell>Shared Date</TableCell>
                  <TableCell>Resend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shares.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((share) => (
                  <TableRow key={share._id}>
                    <TableCell>{share.recordingId?.account || "N/A"}</TableCell>
                    <TableCell>{share.email}</TableCell>
                    <TableCell>
                      {share.userId && share.userId.username ? share.userId.username : "Unknown"}
                    </TableCell>
                    <TableCell>{dayjs(share.createdAt).format("MM/DD/YYYY")}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleResend(share._id, share.email)}
                      >
                        Resend
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={shares.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
