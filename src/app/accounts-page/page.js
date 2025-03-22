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
import EditAccountModal from "@/components/Layouts/EditAccountModal";
import ManageQuestionsModal from "@/components/Layouts/ManageQuestionsModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [accountToArchive, setAccountToArchive] = useState(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [selectedAccountForQuestions, setSelectedAccountForQuestions] = useState(null);

  const handleManageQuestionsClick = (account) => {
    setSelectedAccountForQuestions(account);
    setIsQuestionsModalOpen(true);
  };

  const handleCloseQuestionsModal = () => {
    setIsQuestionsModalOpen(false);
    setSelectedAccountForQuestions(null);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts/fetch");
        const data = await response.json();

        // Filter out archived accounts
        const activeAccounts = data.accounts.filter(
          (account) => !account.archived
        );

        setAccounts(activeAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const handleEditClick = (account) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleArchiveClick = (accountId) => {
    setAccountToArchive(accountId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!accountToArchive) return;

    try {
      const response = await fetch(`/api/accounts/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: accountToArchive }),
      });

      if (response.ok) {
        toast.success("Account archived successfully.");
        setAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account._id !== accountToArchive)
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to archive account.");
      }
    } catch (error) {
      console.error("Error archiving account:", error);
      toast.error("An error occurred while archiving the account.");
    } finally {
      setAccountToArchive(null);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleCancelArchive = () => {
    setAccountToArchive(null);
    setIsConfirmDialogOpen(false);
  };

  return (
    <Box>
      <PageTitle title="Accounts List" />
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
              <TableCell><strong>Testing Number</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account._id}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.dnis}</TableCell>
                <TableCell>{account.testingNumber || "N/A"}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(account)}
                    sx={{ marginRight: "8px" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handleManageQuestionsClick(account)}
                    sx={{ marginRight: "8px" }}
                  >
                    Manage Questions
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleArchiveClick(account._id)}
                  >
                    Archive
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EditAccountModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        account={selectedAccount}
        onAccountUpdated={() => {
          const fetchAccounts = async () => {
            try {
              const response = await fetch("/api/accounts/fetch");
              const data = await response.json();

              // Filter out archived accounts
              const activeAccounts = data.accounts.filter(
                (account) => !account.archived
              );

              setAccounts(activeAccounts);
            } catch (error) {
              console.error("Error fetching accounts:", error);
            }
          };
          fetchAccounts();
        }}
      />

      <ManageQuestionsModal
        open={isQuestionsModalOpen}
        onClose={handleCloseQuestionsModal}
        account={selectedAccountForQuestions}
      />

      <Dialog open={isConfirmDialogOpen} onClose={handleCancelArchive}>
        <DialogTitle>Confirm Archiving</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to archive this account?
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
