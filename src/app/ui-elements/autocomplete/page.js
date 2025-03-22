import React from "react";
import Grid from "@mui/material/Grid";
import ComboBox from "@/components/UIElements/Autocomplete/ComboBox";
import CountrySelect from "@/components/UIElements/Autocomplete/CountrySelect";
import FreeSolo from "@/components/UIElements/Autocomplete/FreeSolo";
import Creatable from "@/components/UIElements/Autocomplete/Creatable";
import CustomizeTextareaComponent from "@/components/UIElements/Autocomplete/CustomizeTextareaComponent";
import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle
        pageTitle="Autocomplete"
        dashboardUrl="/"
        dashboardText="Dashboard"
      />

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* ComboBox */}
          <ComboBox />

          {/* FreeSolo */}
          <FreeSolo /> 
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={6}>
          {/* CountrySelect */}
          <CountrySelect />

          {/* Creatable */}
          <Creatable />
        </Grid>
      </Grid>

      {/* CustomizeTextareaComponent */}
      <CustomizeTextareaComponent />
    </>
  );
}
