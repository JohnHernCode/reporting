"use client";

import React, { useState } from "react";
import { Box, Button, Modal, Typography, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import PageTitle from "@/components/Common/PageTitle";
import RecordingList from "@/components/Dashboard/Recordings/RecordingList";

export default function RecordingDataPage() {
  return (
    <Box sx={{ p: 3 }}>
      <PageTitle pageTitle="Recording Data" dashboardUrl="/" dashboardText="Home"/>
      <RecordingList />
    </Box>
  );
}