import React from 'react';
// import useMediaQuery from "@mui/material/useMediaQuery";
import {
  extendTheme,
 } from '@mui/material/styles';
import { green, lightBlue, orange, red } from "@mui/material/colors";

const darkShade = 200;
const lightShade = 100;

const theme = extendTheme({
  // cssVariables: {
  //   colorSchemeSelector: 'class'
  // },
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        background: {
          default: "#181818",
          paper: "#303030",
        },
        primary: {
          main: lightBlue[700],
        },
        error: {
          main: red[darkShade],
        },
        info: {
          main: lightBlue[darkShade],
        },
        success: {
          main: green[darkShade],
        },
        warning: {
          main: orange[darkShade],
        },
      },
    },
    light: {
      palette: {
        mode: "light",
        primary: {
          main: lightBlue[600],
        },
        error: {
          main: red[lightShade],
        },
        info: {
          main: lightBlue[lightShade],
        },
        success: {
          main: green[lightShade],
        },
        warning: {
          main: orange[lightShade],
        },
      },
    },
  }
});

export default theme;
