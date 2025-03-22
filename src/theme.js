'use client';

import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette: {
    text: {
      primary: '#5B5B98',
      secondary: '#5B5B98',
      disabled: '#5B5B98',
      hint: '#5B5B98',
    },
    primary: {
      main: "#757FEF",
    },
    secondary: {
      main: "#818093",
    },
    success: {
      main: "#00B69B",
    },
    info: {
      main: "#2DB6F5",
    },
    warning: {
      main: "#FFBC2B",
    },
    danger: {
      main: "#EE368C",
    },
    dark: {
      main: "#260944",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
});

export default theme;
