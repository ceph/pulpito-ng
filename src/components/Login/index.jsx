import { useState } from "react";
import Button from "@mui/material/Button";
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import GitHubIcon from '@mui/icons-material/GitHub';

import { doLogin, doLogout, useSession } from "../../lib/teuthologyAPI";


export default function Login() {
  const sessionQuery = useSession();
  const [dropMenuAnchor, setDropMenuAnchor] = useState(null);
  const open = Boolean(dropMenuAnchor);
  const handleClick = (event) => {
    setDropMenuAnchor(event.currentTarget);
  };
  const handleClose = () => {
    setDropMenuAnchor(null);
  };

  if ( ! sessionQuery.isSuccess ) return null;

  return (
    <div>
      {sessionQuery.data?.session
        ? <div>
            <Avatar
              alt={sessionQuery.data?.session?.username || ""} 
              src={sessionQuery.data?.session?.avatar_url || ""}
              onClick={handleClick} 
            />
            <Menu
              anchorEl={dropMenuAnchor}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={doLogout}>Logout</MenuItem>
            </Menu>
        </div>
        : <Button 
            variant="contained" 
            color="success"
            onClick={doLogin}
            startIcon={<GitHubIcon fontSize="small" /> }
            disabled={sessionQuery.isError}
          >
            Login 
          </Button>
      }
    </div>
  );
}
