import React from "react";
import UploadMultipleFiles from "@/components/Forms/FileUploader/UploadMultipleFiles";
import PageTitle from "@/components/Common/PageTitle";

export default function Page() {
  return (
    <>
      <PageTitle
        pageTitle="File Uploader"
        dashboardUrl="/"
        dashboardText="Dashboard"
      />

      <UploadMultipleFiles />
    </>
  );
}
