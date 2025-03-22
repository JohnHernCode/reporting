"use client";

import React, { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import styles from "@/components/Layouts/ControlPanelModal/RTLSwitch.module.css";
import { Typography } from "@mui/material";

const RTLSwitch = () => {
  const [dirAttribute, setDirAttribute] = useState('ltr');

  useEffect(() => {
    const storedDirAttribute = localStorage.getItem('dirAttribute');
    if (storedDirAttribute) {
      setDirAttribute(storedDirAttribute);
      document.documentElement.setAttribute('dir', storedDirAttribute);
    }
  }, []);

  const handleButtonClick = () => {
    const newDirAttribute = dirAttribute === 'ltr' ? 'rtl' : 'ltr';
    setDirAttribute(newDirAttribute);
    localStorage.setItem('dirAttribute', newDirAttribute);
    document.documentElement.setAttribute('dir', newDirAttribute);
  };
  return (
    <>
      <div className={styles.darkModeBox}>
  
        <Typography
          as="h2"
          sx={{
            color: "#000 !important",
            fontSize: 16,
            fontWeight: 500,
            mb: "15px",
            pb: "5px",
            borderBottom: "1px solid #eee",
          }}
        >
          LTR/RTL Demos
        </Typography>

        <div className="lang-sidebar">
          <Button 
            variant="contained"
            sx={{
              textTransform: 'capitalize',
              fontSize: '13px'
            }}
            className="whiteColor mr-10px"
            onClick={handleButtonClick}
          >
            Switch to RTL/LTR
          </Button> 
        </div>
      </div>
    </>
  );
};

export default RTLSwitch;
