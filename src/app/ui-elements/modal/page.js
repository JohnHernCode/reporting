import React from "react";
import Grid from "@mui/material/Grid";
import BasicModal from "@/components/UIElements/Modal/BasicModal";
import NestedModal from "@/components/UIElements/Modal/NestedModal";
import Transitions from "@/components/UIElements/Modal/Transitions";
import TransitionsDialog from "@/components/UIElements/Modal/TransitionsDialog";
import CustomizationDialog from "@/components/UIElements/Modal/CustomizationDialog";
import FullScreenDialogs from "@/components/UIElements/Modal/FullScreenDialogs";
import ScrollingLongContent from "@/components/UIElements/Modal/ScrollingLongContent";

import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle pageTitle="Modal" dashboardUrl="/" dashboardText="Dashboard" />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* BasicModal */}
          <BasicModal />

          {/* Transitions */}
          <Transitions />

          {/* TransitionsDialog */}
          <TransitionsDialog />

          {/* FullScreenDialogs */}
          <FullScreenDialogs />
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* NestedModal */}
          <NestedModal />

          {/* CustomizationDialog */}
          <CustomizationDialog />

          {/* ScrollingLongContent */}
          <ScrollingLongContent />
        </Grid>
      </Grid>
    </>
  );
}
