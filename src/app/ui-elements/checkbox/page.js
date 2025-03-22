import React from "react";
import Grid from "@mui/material/Grid";
import Basic from "@/components/UIElements/Checkbox/Basic";
import Label from "@/components/UIElements/Checkbox/Label";
import Size from "@/components/UIElements/Checkbox/Size";
import Color from "@/components/UIElements/Checkbox/Color";
import Icon from "@/components/UIElements/Checkbox/Icon";
import Controlled from "@/components/UIElements/Checkbox/Controlled";

import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle
        pageTitle="Checkbox"
        dashboardUrl="/"
        dashboardText="Dashboard"
      />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* Basic */}
          <Basic />

          {/* Size */}
          <Size />

          {/* Icon */}
          <Icon />
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={6}>
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
