'use client'

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/Settings/NavBar.module.css";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <>
      <nav className={styles.topNavStyle}>
        <ul>
          <li className={pathname == "/settings/account/" ? styles.active : ""}>
            <Link href="/account/">Grade Reporting</Link>
          </li>
          <li className={pathname == "/settings/security/" ? styles.active : ""}>
            <Link href="/settings/security/">Security</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default NavBar;
