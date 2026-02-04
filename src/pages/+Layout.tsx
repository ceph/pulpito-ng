import { CookiesProvider } from "react-cookie";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme, MantineProvider } from '@mantine/core';
import { AppShell, Burger, Group, Button, NavLink, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import Login from "../components/Login";

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import "./+Layout.css";
import { MACHINE_TYPES } from "#src/lib/paddles";


const theme = createTheme({
  /** Put your mantine theme override here */
});

const navLinks = {
  "Queue": "/queue",
  "Runs": "/runs",
  "Nodes": `/nodes?machine_type=${MACHINE_TYPES[0]}`,
  "Node Lock Stats": `/stats/nodes/lock?machine_type=${MACHINE_TYPES[0]}`,
  "Node Jobs Stats": `/stats/nodes/jobs?machine_type=${MACHINE_TYPES[0]}`,
}

function Layout(props: any) {
  const [opened, { toggle }] = useDisclosure();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    },
  });
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <CookiesProvider>
        <QueryClientProvider client={queryClient}>
          <AppShell
            header={{height: 60}}
            navbar={{
              width: 100,
              breakpoint: 'sm',
              collapsed: { mobile: !opened, desktop: true }
            }}
          >
            <AppShell.Header>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Group justify="space-between" style={{ flex: 1 }}>
                <Title
                  order={1}
                  textWrap="nowrap"
                >
                  <a
                    href="/"
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      marginLeft: "12px",
                    }}
                  >
                    Pulpito
                  </a>
                </Title>
                <Group ml="xl" gap={0} visibleFrom="sm">
                  {
                    Object.entries(navLinks).map(
                      (entry) => <Button component="a" href={entry[1]} key={entry[0]}>{entry[0]}</Button>)
                  }
                  <div>
                    <Login />
                  </div>
                </Group>
              </Group>
            </AppShell.Header>
            <AppShell.Navbar py="md" px={4}>
              {Object.entries(navLinks).map((entry) => <NavLink label={entry[0]} href={entry[1]} key={entry[0]}></NavLink>)}
            </AppShell.Navbar>
            <AppShell.Main>
              {props.children}
              </AppShell.Main>
          </AppShell>
        </QueryClientProvider>
      </CookiesProvider>
    </MantineProvider>
  );
}

export default Layout;
