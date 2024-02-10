import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";

import Runs from "./pages/Runs";
import Run from "./pages/Run";
import Job from "./pages/Job";
import Queue from "./pages/Queue";
import Nodes from "./pages/Nodes";
import Node from "./pages/Node";
import StatsNodesLock from "./pages/StatsNodesLock";
import StatsNodesJobs from "./pages/StatsNodesJobs";


const routes = createRoutesFromElements([
  <Route path="/">
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
  </Route>
]);

// const router = createBrowserRouter(routes);

export default routes;
