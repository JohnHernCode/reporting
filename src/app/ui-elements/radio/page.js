import React from "react";
import Grid from "@mui/material/Grid";
import Group from "@/components/UIElements/Radio/Group";
import Direction from "@/components/UIElements/Radio/Direction";
import Controlled from "@/components/UIElements/Radio/Controlled";
import Size from "@/components/UIElements/Radio/Size";
import Color from "@/components/UIElements/Radio/Color";
import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle pageTitle="Radio" dashboardUrl="/" dashboardText="Dashboard" />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* Group */}
          <Group />

          {/* Controlled */}
          <Controlled />
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* Direction */}
          <Direction />

          {/* Size */}
          <Size />

          {/* Color */}
          <Color />
        </Grid>
      </Grid>
    </>
  );
}
