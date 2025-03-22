import React from "react";
import EditorArea from "@/components/Forms/EditorArea";
import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle
        pageTitle="Editors"
        dashboardUrl="/"
        dashboardText="Dashboard"
      />

      <EditorArea />
    </>
  );
}
