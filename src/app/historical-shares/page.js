"use client";

import React, { useState } from "react";
import { Box, Button, Modal, Typography, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import PageTitle from "@/components/Common/PageTitle";
import HistoricalShares from "@/components/Dashboard/HistoricalShares/HistoricalShares";

export default function HistoricalSharesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <PageTitle pageTitle="Historical Shares" dashboardUrl="/" dashboardText="Home"/>
      <HistoricalShares />
    </Box>
  );
}