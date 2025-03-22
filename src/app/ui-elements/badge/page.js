import React from "react";
import Grid from "@mui/material/Grid";
import BasicBadge from "@/components/UIElements/Badge/BasicBadge";
import Dynamic from "@/components/UIElements/Badge/Dynamic";
import MaximumValue from "@/components/UIElements/Badge/MaximumValue";
import BadgeOverlap from "@/components/UIElements/Badge/BadgeOverlap";
import Accessibility from "@/components/UIElements/Badge/Accessibility";

import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle pageTitle="Badge" dashboardUrl="/" dashboardText="Dashboard" />

      <Grid
        container
        rowSpacing={2}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 3 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* BasicBadge */}
          <BasicBadge />

          {/* MaximumValue */}
          <MaximumValue />

          {/* BadgeOverlap */}
          <BadgeOverlap />
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* Dynamic */}
          <Dynamic />

          {/* Accessibility */}
          <Accessibility />
        </Grid>
      </Grid>
    </>
  );
}
