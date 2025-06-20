import { Link as RouterLink } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Divider from '@mui/material/Divider';

const PREFIX = 'index';

const classes = {
  toolbarIcon: `${PREFIX}-toolbarIcon`,
  drawerPaper: `${PREFIX}-drawerPaper`,
  drawerLink: `${PREFIX}-drawerLink`
};

const StyledSwipeableDrawer = styled(SwipeableDrawer)((
  {
    theme
  }
) => ({
  [`& .${classes.toolbarIcon}`]: {
    ...theme.mixins.toolbar,
    position: "sticky",
    top: "0",
    zIndex: theme.zIndex.drawer + 1,
    background: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
  },

  [`& .${classes.drawerPaper}`]: {
    width: "150px",
  },

  [`& .${classes.drawerLink}`]: {
    color: theme.palette.text.primary,
    textDecoration: "none",
    padding: "10px 20px",
    fontSize: "16px",
  }
}));

export default function Drawer(props) {
  const theme = useTheme();

  return (
    <StyledSwipeableDrawer
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
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.toolbarIcon}>
        <IconButton
          onClick={() => {
            props.setDrawerOpen(false);
          }}
          size="large">
          <MenuIcon />
        </IconButton>
      </div>
      <RouterLink to="/queue" className={classes.drawerLink}>
        Queue
      </RouterLink>
      <RouterLink to="/runs" className={classes.drawerLink}>
        Runs
      </RouterLink>
      <RouterLink to="/jobs" className={classes.drawerLink}>
        Jobs
      </RouterLink>
      <Divider />
      <RouterLink to="/nodes?machine_type=smithi" className={classes.drawerLink}>
        Nodes
      </RouterLink>
      <RouterLink to="/stats/nodes/lock" className={classes.drawerLink}>
        Node Locks Stats
      </RouterLink>
      <RouterLink to="/stats/nodes/jobs" className={classes.drawerLink}>
        Node Jobs Stats
      </RouterLink>
      <Divider />
    </StyledSwipeableDrawer>
  );
}
