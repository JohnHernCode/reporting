// "use client";
//
// import React from "react";
// import Link from "next/link";
// import Grid from "@mui/material/Grid";
// import { Typography } from "@mui/material";
// import { Box } from "@mui/system";
// import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";
// import styles from "@/components/Authentication/Authentication.module.css";
// import Image from "next/image";
//
// const ForgotPasswordForm = () => {
//   const handleSubmit = (event) => {
//     event.preventDefault();
//     const data = new FormData(event.currentTarget);
//     console.log({
//       email: data.get("email"),
//       password: data.get("password"),
//     });
//   };
//
//   return (
//     <>
//       <div className="authenticationBox">
//         <Box
//           component="main"
//           sx={{
//             maxWidth: "510px",
//             ml: "auto",
//             mr: "auto",
//             padding: "50px 0 100px",
//           }}
//         >
//           <Grid item xs={12} md={12} lg={12} xl={12}>
//             <Box>
//               <Typography as="h1" fontSize="28px" fontWeight="700" mb="5px">
//                 Forgot Password?{" "}
//                 {/*<Image*/}
//                 {/*  src="/images/favicon.png"*/}
//                 {/*  alt="favicon"*/}
//                 {/*  className={styles.favicon}*/}
//                 {/*  width={30}*/}
//                 {/*  height={30}*/}
//                 {/*/>*/}
//               </Typography>
//
//               <Typography fontSize="15px" mb="30px">
//                 Enter your email and we′ll send you instructions to reset your
//                 password
//               </Typography>
//
//               <Box component="form" noValidate onSubmit={handleSubmit}>
//                 <Box
//                   sx={{
//                     background: "#fff",
//                     padding: "30px 20px",
//                     borderRadius: "10px",
//                     mb: "20px",
//                   }}
//                   className="bg-black"
//                 >
//                   <Grid container alignItems="center" spacing={2}>
//                     <Grid item xs={12}>
//                       <Typography
//                         component="label"
//                         sx={{
//                           fontWeight: "500",
//                           fontSize: "14px",
//                           mb: "10px",
//                           display: "block",
//                         }}
//                       >
//                         Email
//                       </Typography>
//
//                       <TextField
//                         required
//                         fullWidth
//                         id="email"
//                         label="Email Address"
//                         name="email"
//                         autoComplete="email"
//                         InputProps={{
//                           style: { borderRadius: 8 },
//                         }}
//                       />
//                     </Grid>
//                   </Grid>
//                 </Box>
//
//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   sx={{
//                     mt: 1,
//                     textTransform: "capitalize",
//                     borderRadius: "8px",
//                     fontWeight: "500",
//                     fontSize: "16px",
//                     padding: "12px 10px",
//                     color: "#fff !important"
//                   }}
//                 >
//                   Send Reset Link
//                 </Button>
//               </Box>
//
//               <Box as="div" textAlign="center" mt="20px">
//                 <Link
//                   href="/authentication/sign-in/"
//                   className="primaryColor text-decoration-none"
//                 >
//                   <i className="ri-arrow-left-s-line"></i> Back to Sign in
//                 </Link>
//               </Box>
//             </Box>
//           </Grid>
//         </Box>
//       </div>
//     </>
//   );
// };
//
// export default ForgotPasswordForm;



"use client";

import React, { useState } from "react";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !newPassword) {
      setError("Both email and new password are required.");
      return;
    }

    try {
      const response = await fetch("/api/users/forgot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, token: resetToken }),
      });

      if (response.ok) {
        setSuccess("Password reset successfully!");
        setError("");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <div className="authenticationBox">
        <Box
          component="main"
          sx={{
            maxWidth: "510px",
            ml: "auto",
            mr: "auto",
            padding: "50px 0 100px",
          }}
        >
          <Grid item xs={12} md={12} lg={12} xl={12}>
            <Box>
              <Typography as="h1" fontSize="28px" fontWeight="700" mb="5px">
                Reset Your Password
              </Typography>

              <Typography fontSize="15px" mb="30px">
                Enter your email, token (if needed), and new password to reset
              </Typography>

              <Box component="form" noValidate onSubmit={handleSubmit}>
                <Box
                  sx={{
                    background: "#fff",
                    padding: "30px 20px",
                    borderRadius: "10px",
                    mb: "20px",
                  }}
                  className="bg-black"
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "10px",
                          display: "block",
                        }}
                      >
                        Email
                      </Typography>

                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                          style: { borderRadius: 8 },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "10px",
                          display: "block",
                        }}
                      >
                        Reset Token (Optional for Now)
                      </Typography>

                      <TextField
                        fullWidth
                        id="resetToken"
                        label="Reset Token"
                        name="resetToken"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        InputProps={{
                          style: { borderRadius: 8 },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "10px",
                          display: "block",
                        }}
                      >
                        New Password
                      </Typography>

                      <TextField
                        required
                        fullWidth
                        id="password"
                        label="New Password"
                        name="password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        InputProps={{
                          style: { borderRadius: 8 },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {error && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
                {success && (
                  <Typography color="success.main" sx={{ mb: 2 }}>
                    {success}
                  </Typography>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 1,
                    textTransform: "capitalize",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "16px",
                    padding: "12px 10px",
                    color: "#fff !important",
                  }}
                >
                  Reset Password
                </Button>
              </Box>

              <Box as="div" textAlign="center" mt="20px">
                <Link
                  href="/authentication/sign-in/"
                  className="primaryColor text-decoration-none"
                >
                  <i className="ri-arrow-left-s-line"></i> Back to Sign in
                </Link>
              </Box>
            </Box>
          </Grid>
        </Box>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
