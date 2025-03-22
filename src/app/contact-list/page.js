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
  IconButton,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import PageTitle from "@/components/Common/PageTitle";
import EditUserModal from "@/components/Layouts/EditUserModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactListPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/users/fetch");
        const data = await response.json();

        // Filter out archived users and logged-in user
        setUsers(data.users.filter((user) => !user.archived && !user.loggedIn));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleArchive = async (userId) => {
    try {
      const response = await fetch("/api/users/archive", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      if (response.ok) {
        toast.success("User archived successfully.");
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to archive user.");
      }
    } catch (error) {
      console.error("Error archiving user:", error);
      toast.error("An error occurred while archiving the user.");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUpdate = async (userId, updatedFields) => {
    try {
      console.log("Sending updated fields to API:", updatedFields);
      const response = await fetch(`/api/users/edit?id=${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (response.ok) {
        toast.success("User updated successfully.");
        const updatedUser = await response.json();

        // Update the local state with the new user details
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, ...updatedFields } : user
          )
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("An error occurred while updating the user.");
    }
  };

  if (loading) {
    return (
      <Box>
        <PageTitle title="Contact List" />
        <Typography variant="h6" sx={{ textAlign: "center", marginTop: "20px" }}>
          Loading users...
        </Typography>
      </Box>
    );
  }

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, users.length - page * rowsPerPage);

  return (
    <Box>
      <PageTitle title="Contact List" />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="right">Edit</TableCell>
              <TableCell align="right">Archive</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
                ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : users
            ).map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.team || "N/A"}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEditClick(user)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="secondary" onClick={() => handleArchive(user._id)}>
                    <ArchiveIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {selectedUser && (
        <EditUserModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          onUpdate={handleUpdate}
        />
      )}
      <ToastContainer />
    </Box>
  );
}
