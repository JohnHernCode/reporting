"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import LeftSidebar from "@/components/Layouts/LeftSidebar";
import TopNavbar from "@/components/Layouts/TopNavbar";
import Footer from "@/components/Layouts/Footer";
import ScrollToTop from "../components/Layouts/ScrollToTop";
import ControlPanelModalAccounts from "../components/Layouts/ControlPanelModalAccounts";
import ControlPanelModalAgents from "../components/Layouts/ControlPanelModalAgents";
import ControlPanelModal from "../components/Layouts/ControlPanelModal";

const LayoutProvider = ({ children }) => {
  const [active, setActive] = useState(false);
  const pathname = usePathname();

  const toogleActive = () => {
    setActive(!active);
  };
  return (
    <>
      <div className={`main-wrapper-content ${active && "active"}`}>
        {!(
          pathname === "/authentication/sign-in/" ||
          pathname === "/authentication/sign-up/" ||
          pathname === "/authentication/forgot-password/" ||
          pathname === "/authentication/lock-screen/" ||
          pathname === "/authentication/confirm-mail/" ||
          pathname === "/authentication/audio-screen/" ||
          pathname === "/authentication/logout/"
        ) && (
          <>
            <TopNavbar toogleActive={toogleActive} />

            <LeftSidebar toogleActive={toogleActive} />
          </>
        )}

        <div className="main-content">
          {children}
          {!(
            pathname === "/authentication/sign-in/" ||
            pathname === "/authentication/sign-up/" ||
            pathname === "/authentication/forgot-password/" ||
            pathname === "/authentication/lock-screen/" ||
            pathname === "/authentication/confirm-mail/" ||
            pathname === "/authentication/audio-screen/" ||
            pathname === "/authentication/logout/"
          ) && <Footer />}
        </div>
      </div>

      {/* ScrollToTop */}
      <ScrollToTop />

      {(
        pathname === "/contact-list/"
      ) && <ControlPanelModal />}
      {(
        pathname === "/accounts-page/"
      ) && <ControlPanelModalAccounts />}
      {(
        pathname === "/agents-page/"
      ) && <ControlPanelModalAgents />}
    </>
  );
};

export default LayoutProvider;
