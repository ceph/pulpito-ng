import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import Login from "../Login";

import './index.css';

type AppBarProps = {
  setDrawerOpen: Function,
};

export default function AppBar(props: AppBarProps) {
  return (
    <MuiAppBar id="appbar" position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={() => {
            props.setDrawerOpen(true);
          }}
          size="large"
        >
          <MenuIcon />
        </IconButton>
        <Typography
          id="title"
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
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
        </Typography>
        <div>
          <Login />
        </div>
      </Toolbar>
    </MuiAppBar>
  );
}
