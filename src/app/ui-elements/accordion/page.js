import React from "react";
import Grid from "@mui/material/Grid";
import BasicAccordion from "@/components/UIElements/Accordion/BasicAccordion";
import ControlledAccordion from "@/components/UIElements/Accordion/ControlledAccordion";
import Customization from "@/components/UIElements/Accordion/Customization";

import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle
        pageTitle="Accordion"
        dashboardUrl="/"
        dashboardText="Dashboard"
      />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* BasicAccordion */}
          <BasicAccordion />

          {/* Customization */}
          <Customization />
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* ControlledAccordion */}
          <ControlledAccordion />
        </Grid>
      </Grid>
    </>
  );
}
