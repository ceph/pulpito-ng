import { useState } from "react";

import { Switch, Route, Redirect } from "react-router-dom";

import AppBar from "./components/AppBar";
import Drawer from "./components/Drawer";
import Runs from "./pages/Runs";
import Run from "./pages/Run";
import Job from "./pages/Job";
import Queue from "./pages/Queue";

import "./App.css";

type AppProps = {
  darkMode: boolean;
  toggleDarkMode: Function;
}

function App(props: AppProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="App">
      <header className="App-header">
        <AppBar
          setDrawerOpen={setDrawerOpen}
          darkMode={props.darkMode}
          toggleDarkMode={props.toggleDarkMode}
        />
      </header>
      <Drawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <div className="App-body">
        <Switch>
          <Route path="/" exact>
            <Runs />
          </Route>
          <Route path="/runs" exact>
            <Runs />
          </Route>
          <Route path="/runs/:name" exact>
            <Run />
          </Route>
          <Route path="/runs/:name/jobs/:job_id">
            <Job />
          </Route>
          <Route path="/queue" exact>
            <Queue />
          </Route>
          <Redirect from="/:name/:id" to="/runs/:name/jobs/:id" />
          <Redirect from="/:name" to="/runs/:name" />
        </Switch>
      </div>
    </div>
  );
}

export default App;