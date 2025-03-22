"use client";

import React, { useState } from "react";
import { Box, Button, Grid, Card, Typography, IconButton } from "@mui/material";
import TransitionsDialog from "@/components/UIElements/Modal/TransitionsDialog";
import PageTitle from "@/components/Common/PageTitle";
import { BarChart, PieChart } from "@mui/x-charts";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";

export default function Dashboard() {
  const [selectedLayout, setSelectedLayout] = useState("layout1");
  const [showDialog, setShowDialog] = useState(false);

  const layouts = {
    layout1: (
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4">199</Typography>
            <Typography variant="subtitle1">New Tickets</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4">207</Typography>
            <Typography variant="subtitle1">Open Tickets</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4">30</Typography>
            <Typography variant="subtitle1">On Hold</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h4">150</Typography>
            <Typography variant="subtitle1">Unassigned</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Tickets Status</Typography>
            <BarChart
              xAxis={[{ scaleType: "band", data: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] }]}
              series={[{ data: [10, 20, 15, 10, 8, 12, 10] }]}
              height={200}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">Customer Satisfaction</Typography>
            <PieChart
              series={[{ data: [{ value: 71.25, label: "Overall" }] }]}
              height={200}
            />
          </Card>
        </Grid>
      </Grid>
    ),
    layout2: (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TransitionsDialog />
        </Grid>
      </Grid>
    ),
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageTitle pageTitle="Dashboard" dashboardUrl="/" dashboardText="Home" />
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button variant="contained" onClick={() => setShowDialog(true)}>
          Open Dialog
        </Button>
        <Button variant="outlined" onClick={() => setSelectedLayout(selectedLayout === "layout1" ? "layout2" : "layout1")}>
          Toggle Layout
        </Button>
        <Box>
          <IconButton>
            <SettingsIcon />
          </IconButton>
          <IconButton>
            <HelpIcon />
          </IconButton>
        </Box>
      </Box>
      {layouts[selectedLayout]}
    </Box>
  );
}
