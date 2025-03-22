'use client'

import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import styles from "@/components/Layouts/LeftSidebar/SubMenu.module.css";
import { usePathname } from "next/navigation";

const SidebarLabel = styled("span")(({ theme }) => ({
  position: "relative",
  top: "-3px",
}));

const SubMenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false);
  const showSubnav = () => setSubnav(!subnav); 
  const pathname = usePathname()

  return (
    <>
      <Link
        href={item.path}
        onClick={item.subNav && showSubnav}
        className={`${styles.sidebarLink} ${
          pathname == item.path && "sidebarLinkActive"
        }`}
      >
        <div>
          {item.icon}
          <SidebarLabel className="ml-1">{item.title}</SidebarLabel>
        </div>
        <div>
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
            ? item.iconClosed
            : null}
        </div>
      </Link>
      {subnav &&
        item.subNav.map((item, index) => {
          return (
            <Link
              href={item.path}
              key={index}
              className={`${styles.sidebarLink2} ${
                pathname == item.path && "sidebarLinkActive2"
              }`}
            >
              {item.icon}
              {item.title}
            </Link>
          );
        })}
    </>
  );
};

export default SubMenu;
