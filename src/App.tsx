import { useState, MouseEventHandler } from "react";

import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";

import AppBar from "./components/AppBar";
import Drawer from "./components/Drawer";
import Runs from "./pages/Runs";
import Run from "./pages/Run";
import Job from "./pages/Job";
import Queue from "./pages/Queue";
import Nodes from "./pages/Nodes";
import Node from "./pages/Node";
import StatsNodesLock from "./pages/StatsNodesLock";
import StatsNodesJobs from "./pages/StatsNodesJobs";
import { ErrorBoundary } from "react-error-boundary";

import "./App.css";
import ErrorFallback from "./components/ErrorFallback";

type AppProps = {
  darkMode: boolean;
  toggleDarkMode: MouseEventHandler<HTMLElement>;
};

function App(props: AppProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="App">
      <Helmet>
        <title>Pulpito</title>
      </Helmet>
      <header className="App-header">
        <AppBar
          setDrawerOpen={setDrawerOpen}
          darkMode={props.darkMode}
          toggleDarkMode={props.toggleDarkMode}
        />
      </header>
      <Drawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <div className="App-body">
        <ErrorBoundary FallbackComponent={ErrorFallback} >
          <Routes>
            <Route path="/" element={<Runs />} />
            <Route path="/nodes" element={<Nodes />} />
            <Route path="/nodes/:name" element={<Node />} />
            <Route path="/stats/nodes/jobs" element={<StatsNodesJobs />} />
            <Route path="/stats/nodes/lock" element={<StatsNodesLock />} />
            <Route path="/runs" element={<Runs />} />
            <Route path="/runs/:name" element={<Run />} />
            <Route path="/runs/:name/jobs/:job_id" element={<Job />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/:name" element={<Run />} />
            <Route path="/:name/:job_id" element={<Job />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
