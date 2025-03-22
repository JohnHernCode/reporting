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

export default function ArchivedAccountsPage() {
  const [archivedAccounts, setArchivedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchivedAccounts = async () => {
      try {
        const response = await fetch("/api/accounts/archived");
        const data = await response.json();
        setArchivedAccounts(data.accounts); // Set archived accounts
      } catch (error) {
        console.error("Error fetching archived accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedAccounts();
  }, []);

  const handleRestore = async (accountId) => {
    try {
      const response = await fetch("/api/accounts/restore", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: accountId }),
      });

      if (response.ok) {
        toast.success("Account restored successfully.");
        // Remove the restored account from the list
        setArchivedAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account._id !== accountId)
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to restore account.");
      }
    } catch (error) {
      console.error("Error restoring account:", error);
      toast.error("An error occurred while restoring the account.");
    }
  };

  if (loading) {
    return (
      <Box>
        <PageTitle title="Archived Accounts" />
        <Typography variant="h6" sx={{ textAlign: "center", marginTop: "20px" }}>
          Loading archived accounts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageTitle title="Archived Accounts" />
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
              <TableCell><strong>Account Name</strong></TableCell>
              <TableCell><strong>DNIS</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {archivedAccounts.map((account) => (
              <TableRow key={account._id}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.dnis}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRestore(account._id)}
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
