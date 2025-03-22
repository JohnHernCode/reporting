"use client";

import Profile from "@/components/Settings/Account/Profile";
import NavBar from "@/components/Settings/NavBar";
import Card from "@mui/material/Card";
import { Typography, Box, Button } from "@mui/material";
import { toast } from "react-toastify";

export default function Page() {

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

        {/* NavBar */}
        {/*<NavBar />*/}

        {/* Profile */}
        <Profile />
      </Card>
    </>
  );
}
