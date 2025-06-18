import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { CookiesProvider } from "react-cookie";
import axios from "axios";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import type { QueryKey } from "./lib/paddles.d";
import getThemeOptions from "./lib/theme";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
      cacheTime: 0,
      queryFn: async (params) => {
        const queryKey = params.queryKey as QueryKey;
        return axios.get(queryKey[1].url).then((resp) => resp.data);
      },
    },
  },
});

type DarkModeState = {
  system: boolean;
  user?: boolean;
};

function useDarkMode(): [boolean, Function] {
  const systemDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    const storedPreference = localStorage.getItem("theme");
    return storedPreference ? storedPreference === "dark" : systemDarkMode;
  });

  React.useEffect(() => {
    document.body.setAttribute("color-scheme",darkMode ? "dark" : "light");
  }, [darkMode]);

  function toggleDarkMode() {
    const newMode = !darkMode;
    localStorage.setItem("theme", newMode ? "dark" : "light");
    setDarkMode(newMode);
  }

  return[darkMode, toggleDarkMode];
}

export default function Root() {
  const [darkMode, setDarkMode] = useDarkMode();
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const theme = React.useMemo(() => {
    const paletteType = darkMode ? "dark" : "light";
    const theme = createTheme({
      ...getThemeOptions(paletteType),
    });
    return theme;
  }, [darkMode]);
  return (
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CookiesProvider>
              <Router>
                <QueryParamProvider adapter={ReactRouter6Adapter}>
                  <CssBaseline />
                  <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtools initialIsOpen={false} />
                    <App darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                  </QueryClientProvider>
                </QueryParamProvider>
              </Router>
            </CookiesProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </React.StrictMode>
  );
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<Root />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
