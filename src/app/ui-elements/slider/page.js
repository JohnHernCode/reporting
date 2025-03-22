import React from "react";
import Grid from "@mui/material/Grid";
import Continuous from "@/components/UIElements/Slider/Continuous";
import Sizes from "@/components/UIElements/Slider/Sizes";
import Discrete from "@/components/UIElements/Slider/Discrete";
import SmallSteps from "@/components/UIElements/Slider/SmallSteps";
import CustomMarks from "@/components/UIElements/Slider/CustomMarks";
import RestrictedValues from "@/components/UIElements/Slider/RestrictedValues";
import LabelAlwaysVisible from "@/components/UIElements/Slider/LabelAlwaysVisible";
import PageTitle from "@/components/Common/PageTitle";

export default function Slider() {
  return (
    <>
      <PageTitle
        pageTitle="Slider"
        dashboardUrl="/"
        dashboardText="Dashboard"
      />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={6} lg={6} xl={6}>
          {/* Continuous */}
          <Continuous />

          {/* Discrete */}
          <Discrete />

          {/* CustomMarks */}
          <CustomMarks />

          {/* LabelAlwaysVisible */}
          <LabelAlwaysVisible />
        </Grid>

        <Grid item xs={12} md={6} lg={6} xl={6}>
          {/* Sizes */}
          <Sizes />

          {/* SmallSteps */}
          <SmallSteps />

          {/* RestrictedValues */}
          <RestrictedValues />
        </Grid>
      </Grid>
    </>
  );
}
