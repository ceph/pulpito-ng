import { useState } from "react";

import { Routes, Route, Navigate } from "react-router-dom";
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
import Schedule from "./pages/Schedule";

import "./App.css";

type AppProps = {
  darkMode: boolean;
  toggleDarkMode: Function;
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
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/:name" element={<Run />} />
          <Route path="/:name/:job_id" element={<Job />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
