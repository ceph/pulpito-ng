import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import Login from "../Login";


const PREFIX = 'index';

const classes = {
  appBar: `${PREFIX}-appBar`,
  title: `${PREFIX}-title`,
  toolbarIcon: `${PREFIX}-toolbarIcon`
};

type AppBarProps = {
  setDrawerOpen: Function,
};

export default function AppBar(props: AppBarProps) {
  return (
    <MuiAppBar position="static" className={classes.appBar}>
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
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          className={classes.title}
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
