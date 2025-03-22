"use client";

import React from "react";
import Link from "next/link";
import styles from "../../../styles/PageTitle.module.css";

const PageTitle = ({ pageTitle, dashboardUrl = "/", dashboardText }) => {
  return (
    <>
      <div className={styles.pageTitle}>
        <h1>{pageTitle}</h1>
        <ul>
          <li>
            <Link href={dashboardUrl}>{dashboardText}</Link>
          </li>
          <li>{pageTitle}</li>
        </ul>
      </div>
    </>
  );
};

export default PageTitle;
