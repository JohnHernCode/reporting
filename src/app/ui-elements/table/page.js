import React from "react";
import Grid from "@mui/material/Grid";
import BasicTable from "@/components/UIElements/Table/BasicTable";
import RecordingList from "@/components/Dashboard/Recordings/RecordingList";
import DataTable from "@/components/UIElements/Table/DataTable";
import DenseTable from "@/components/UIElements/Table/DenseTable";
import SortingSelectingTable from "@/components/UIElements/Table/SortingSelectingTable";
import CustomizationTable from "@/components/UIElements/Table/CustomizationTable";
import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle pageTitle="Table" dashboardUrl="/" dashboardText="Dashboard" />

      {/* BasicTable */}
      <BasicTable />

      {/* RecentOrders */}
      <RecordingList />

      {/* DataTable */}
      <DataTable />

      {/* DenseTable */}
      <DenseTable />

      {/* SortingSelectingTable */}
      <SortingSelectingTable />

      {/* CustomizationTable */}
      <CustomizationTable />
    </>
  );
}
