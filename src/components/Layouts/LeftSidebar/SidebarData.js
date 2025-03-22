"use client";

import React from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GridViewIcon from "@mui/icons-material/GridView";
import LayersIcon from "@mui/icons-material/Layers";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AddchartIcon from "@mui/icons-material/Addchart";
import GradingIcon from "@mui/icons-material/Grading";

/**
 * Generates Sidebar Data based on the user role
 * @param {string} userRole - The role of the user (e.g., "agent", "admin", etc.)
 * @returns {Array} Sidebar menu items
 */
export function getSidebarData(userRole) {
  if (userRole === "agent") {
    // ✅ Agents ONLY see these 3 options
    return [
      {
        title: "My Evaluations",
        path: "/account/",
        icon: <GradingIcon />,
      },
      {
        title: "Settings",
        path: "/settings/security/",
        icon: <SettingsIcon />,
      },
      {
        title: "Logout",
        path: "/authentication/logout/",
        icon: <LockIcon />,
      },
    ];
  }

  // ✅ Everyone else sees the full menu
  return [
    {
      title: "Dashboard",
      path: "/",
      icon: <GridViewIcon />,
      iconClosed: <KeyboardArrowRightIcon />,
      iconOpened: <KeyboardArrowDownIcon />,
      subNav: [
        { title: "Recording Data", path: "/recording-data/" },
        { title: "Historical Shares", path: "/historical-shares/" },
        { title: "All Evaluations", path: "/all-evaluations/" },
        { title: "All Disputes", path: "/disputes/" },
      ],
    },
    {
      title: "Users",
      path: "/contact-list/",
      icon: <PostAddIcon />,
      conClosed: <KeyboardArrowRightIcon />,
      iconOpened: <KeyboardArrowDownIcon />,
      subNav: [
        { title: "Archived Users", path: "/archived-users/",},
      ],
    },
    {
      title: "Accounts",
      path: "/accounts-page/",
      icon: <AddchartIcon />,
      iconClosed: <KeyboardArrowRightIcon />,
      iconOpened: <KeyboardArrowDownIcon />,

      subNav: [
        {
          title: "Archived Accounts",
          path: "/archived-accounts/",
        },
      ],
    },
    {
      title: "Agents",
      path: "/agents-page/",
      icon: <LayersIcon />,
      iconClosed: <KeyboardArrowRightIcon />,
      iconOpened: <KeyboardArrowDownIcon />,

      subNav: [
        { title: "Archived Agents", path: "/archived-agents/"},
        { title: "Unregistered Agents", path: "/unregistered-agents/" },
      ],
    },
    {
      title: "My Evaluations",
      path: "/account/",
      icon: <GradingIcon />,
    },
    {
      title: "Settings",
      path: "/settings/security/",
      icon: <SettingsIcon />,
    },
    {
      title: "Logout",
      path: "/authentication/logout/",
      icon: <LockIcon />,
    },
  ];
}
