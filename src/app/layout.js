"use client";

import * as React from 'react';
import "../../styles/remixicon.css";
import "react-tabs/style/react-tabs.css";
import "swiper/css";
import "swiper/css/bundle";
// Chat Styles
import "../../styles/chat.css";
// Globals Styles
import "../../styles/globals.css";
// Rtl Styles
import "../../styles/rtl.css";
// Dark Mode Styles
import "../../styles/dark.css";
// Theme Styles
import theme from '@/theme';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LayoutProvider from '@/providers/LayoutProvider';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// export const metadata = {
//   title: 'Curacall Reporting',
//   description: 'Reporting App to view and evaluate call record history',
// }

export default function RootLayout({children}) {
  React.useEffect(() => {
    // ✅ Ensure the WebSocket API route starts
    fetch("/api/socket");
  }, []);

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            
            <LayoutProvider>
              {children}
              <ToastContainer position="top-right" autoClose={3000} />
            </LayoutProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
