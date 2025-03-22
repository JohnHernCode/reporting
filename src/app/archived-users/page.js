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
import TablePagination from "@mui/material/TablePagination";
import PageTitle from "@/components/Common/PageTitle";

export default function ArchivedUsersPage() {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/users/archived");
        const data = await response.json();
        setArchivedUsers(data.users); // Set archived users
      } catch (error) {
        console.error("Error fetching archived users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRestore = async (userId) => {
    try {
      const response = await fetch("/api/users/restore", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      if (response.ok) {
        // Remove the restored user from the list
        setArchivedUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } else {
        console.error("Failed to restore user.");
      }
    } catch (error) {
      console.error("Error restoring user:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box>
        <PageTitle title="Archived Users" />
        <Typography variant="h6" sx={{ textAlign: "center", marginTop: "20px" }}>
          Loading archived users...
        </Typography>
      </Box>
    );
  }

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, archivedUsers.length - page * rowsPerPage);

  return (
    <Box>
      <PageTitle title="Archived Users" />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="archived users table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
                ? archivedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : archivedUsers
            ).map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRestore(user._id)}
                  >
                    Restore
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={3} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={archivedUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
