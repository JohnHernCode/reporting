"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import Button from "@mui/material/Button";
import Image from "next/image";

export default function Page() {
  useEffect(() => {
    // Automatically log the user out when the page loads
    signOut({ redirect: false }); // Prevent auto redirect, handle UI display
  }, []);

  return (
    <>
      <div className="authenticationBox">
        <Box
          component="main"
          sx={{
            padding: "70px 0 100px",
          }}
        >
          <Box
            sx={{
              background: "#fff",
              padding: "30px 20px",
              borderRadius: "10px",
              maxWidth: "510px",
              ml: "auto",
              mr: "auto",
              textAlign: "center",
            }}
            className="bg-black"
          >
            <Box>
              <Image
                src="/images/logo.png"
                alt="Black logo"
                className="black-logo"
                width={147}
                height={41}
              />

              <Image
                src="/images/logo-white.png"
                alt="White logo"
                className="white-logo"
                width={147}
                height={41}
              />
            </Box>

            <Box mt={4} mb={4}>
              <Image
                src="/images/coffee.png"
                alt="Coffee"
                width={111}
                height={106}
              />
            </Box>

            <Typography as="h1" fontSize="20px" fontWeight="500" mb={1}>
              You are Logged Out
            </Typography>

            <Typography>Please log back in when ready</Typography>

            <Button
              href="/authentication/sign-in/"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                textTransform: "capitalize",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "16px",
                padding: "12px 10px",
                color: "#fff !important",
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </div>
    </>
  );
}
