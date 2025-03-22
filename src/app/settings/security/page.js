"use client";

import NavBar from "@/components/Settings/NavBar";
import Card from "@mui/material/Card";
import {Box, Button, Typography} from "@mui/material";
import ChangePassword from "@/components/Settings/Account/ChangePassword";
import {toast} from "react-toastify";
import { useState, useEffect } from "react";

export default function Page() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/users/role"); // ✅ New API route
        if (!response.ok) {
          throw new Error("Failed to fetch user role");
        }
        const data = await response.json();
        setUserRole(data.role); // ✅ Save user role in state
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);


  const handleManualSync = async () => {
    try {
      const response = await fetch("/api/recordings/sync", { method: "POST" });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Sync successful: ${data.newRecordings} new recordings added.`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to sync recordings.");
      }
    } catch (error) {
      console.error("Error during manual sync:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSyncAgents = async () => {
    try {
      const res = await fetch("/api/agent-utility");

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Sync failed");
      }

      const data = await res.json();
      toast.success(`✅ Synced ${data.created} users, skipped ${data.skipped}`);
    } catch (err) {
      console.error("Sync error:", err);
      toast.error(err.message || "Something went wrong");
    }
  }

  const runLinkUtility = async () => {
    const res = await fetch("/api/agent-utility-link");
    const data = await res.json();
    console.log(data);
    alert(`✅ Linked ${data.linked} agents. Missing: ${data.notFound.length}`);
  };

  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px",
          mb: "15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #EEF0F7",
            paddingBottom: "5px",
            mb: "15px",
          }}
        >
          {/*<Typography*/}
          {/*  as="h3"*/}
          {/*  sx={{*/}
          {/*    fontSize: 18,*/}
          {/*    fontWeight: 500,*/}
          {/*  }}*/}
          {/*  className="for-dark-bottom-border"*/}
          {/*>*/}
          {/*  Settings*/}
          {/*</Typography>*/}

          {/* Show "Manual Sync" button only if user is an Admin */}
          {!loading && userRole === "Admin" && (
            <Button variant="contained" color="primary" onClick={handleManualSync}>
              Manual Sync
            </Button>
          )}
          {!loading && userRole === "Admin" && (
            <Button variant="contained" color="secondary" onClick={handleSyncAgents}>
              🔄 Sync Agents to Users
            </Button>
          )}
          {!loading && userRole === "Admin" && (
            <Button variant="contained" color="secondary" onClick={runLinkUtility}>
              🔄 Sync Users to Agents
            </Button>
          )}
        </Box>



        {/* NavBar */}
        {/*<NavBar />*/}
        
        {/* ChangePassword */}
        <ChangePassword />
      </Card>
    </>
  );
}
