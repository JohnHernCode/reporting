import React from "react";
import Grid from "@mui/material/Grid";
import Features from "@/components/ContactList/Features";
import PersonalInformation from "@/components/ContactList/PersonalInformation";
import ActivityTimeline from "@/components/ContactList/ActivityTimeline";
import Overview from "@/components/ContactList/Overview";
import MyTasks from "@/components/ContactList/MyTasks";
import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle
        pageTitle="Profile"
        dashboardUrl="/"
        dashboardText="Dashboard"
      />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={4}>


          {/* Personal Information */}
          <PersonalInformation />

          {/* ActivityTimeline */}
          <ActivityTimeline />
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={8}>
          {/* Features */}
          <Features />

          {/* Overview */}
          <Overview />

          {/* MyTasks */}
          <MyTasks />
        </Grid>
      </Grid>
    </>
  );
}
