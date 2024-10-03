import React from "react";
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { CssBaseline } from "@mui/material";
import {
  ThemeProvider, StyledEngineProvider
} from "@mui/material/styles";
import { CookiesProvider } from "react-cookie";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import theme from "../lib/theme";

import AppBar from "../components/AppBar";
import Drawer from "../components/Drawer";

import "./+Layout.css";


function Layout(props: any) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    },
  });
  return (
    <StyledEngineProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CookiesProvider>
            <QueryClientProvider client={queryClient}>
              <div className="App">
                <header className="App-header">
                  <AppBar
                    setDrawerOpen={setDrawerOpen}
                  />
                </header>
                <Drawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
                <div className="App-body">
                  { props.children }
                </div>
              </div>
            </QueryClientProvider>
          </CookiesProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default Layout;
