import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Divider from '@mui/material/Divider';
import './index.css';

export default function Drawer(props) {
  return (
    <SwipeableDrawer id="drawer"
      open={props.drawerOpen}
      onOpen={() => {
        props.setDrawerOpen(true);
      }}
      onClose={() => {
        props.setDrawerOpen(false);
      }}
      style={{
        height: "100%",
      }}
    >
      <div className="button">
        <IconButton
          onClick={() => {
            props.setDrawerOpen(false);
          }}
          size="large">
          <MenuIcon />
        </IconButton>
      </div>
      <a href="/queue">
        Queue
      </a>
      <a href="/runs">
        Runs
      </a>
      <Divider />
      <a href="/nodes?machine_type=smithi">
        Nodes
      </a>
      <a href="/stats/nodes/lock">
        Node Locks Stats
      </a>
      <a href="/stats/nodes/jobs">
        Node Jobs Stats
      </a>
      <Divider />
    </SwipeableDrawer>
  );
}
