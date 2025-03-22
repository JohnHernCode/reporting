import React from "react";
import Grid from "@mui/material/Grid";
import Basic from "@/components/UIElements/Switch/Basic";
import Label from "@/components/UIElements/Switch/Label";
import Size from "@/components/UIElements/Switch/Size";
import Color from "@/components/UIElements/Switch/Color";
import Controlled from "@/components/UIElements/Switch/Controlled";
import SwitchesWithFormGroup from "@/components/UIElements/Switch/SwitchesWithFormGroup";
import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle
        pageTitle="Switch"
        dashboardUrl="/"
        dashboardText="Dashboard"
      />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={6} xl={6}>
          {/* Basic */}
          <Basic />

          {/* Size */}
          <Size />

          {/* SwitchesWithFormGroup */}
          <SwitchesWithFormGroup />
        </Grid>

        <Grid item xs={12} md={12} lg={6} xl={6}>
          {/* Label */}
          <Label />

          {/* Color */}
          <Color />

          {/* Controlled */}
          <Controlled />
        </Grid>
      </Grid>
    </>
  );
}
