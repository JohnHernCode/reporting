import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { getSidebarData } from "./SidebarData"; // ✅ Import function
import SubMenu from "./SubMenu";
import Link from "next/link";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";

const SidebarNav = styled("nav")(({ theme }) => ({
  background: "#fff",
  boxShadow: "0px 4px 20px rgba(47, 143, 232, 0.07)",
  width: "300px",
  padding: "30px 10px",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  position: "fixed",
  top: 0,
  left: 0,
  transition: "350ms",
  zIndex: "10",
  overflowY: "auto",
}));

const SidebarWrap = styled("div")(({ theme }) => ({
  width: "100%",
}));

const Sidebar = ({ toggleActive }) => {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/users/role");
        if (!response.ok) throw new Error("Failed to fetch role.");
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const SidebarData = getSidebarData(userRole); // ✅ Get Sidebar Data based on Role

  return (
    <>
      <div className="leftSidebarDark">
        <SidebarNav className="LeftSidebarNav">
          <SidebarWrap>
            <Box
              sx={{
                mb: "20px",
                px: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/*<Profile/>*/}
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  className="black-logo"
                  width={80}
                  height={41}
                />

                {/* For Dark Variation */}
                <Image
                  src="/images/logo-white.png"
                  alt="Logo"
                  className="white-logo"
                  width={80}
                  height={41}
                />
              </Link>

              <IconButton
                onClick={toggleActive}
                size="small"
                sx={{
                  background: "rgb(253, 237, 237)",
                  display: { lg: "none" },
                }}
              >
                <ClearIcon />
              </IconButton>
            </Box>

            {SidebarData.map((item, index) => (
              <SubMenu item={item} key={index} />
            ))}
          </SidebarWrap>
        </SidebarNav>
      </div>
    </>
  );
};

export default Sidebar;