import { Avatar, Button, Menu } from "@mantine/core";
import GitHubIcon from '@mui/icons-material/GitHub';

import { doLogin, doLogout, useSession } from "../../lib/teuthologyAPI";


export default function Login() {
  const sessionQuery = useSession();

  if ( ! sessionQuery.isSuccess ) return null;

  return (
    <div>
      {sessionQuery.data?.session
        ? <div>
            <Avatar
              alt={sessionQuery.data?.session?.username || ""} 
              src={sessionQuery.data?.session?.avatar_url || ""}
            />
            <Menu
            >
              <Menu.Item onClick={doLogout}>Logout</Menu.Item>
            </Menu>
        </div>
        : <Button 
            variant="contained" 
            color="success"
            onClick={() => doLogin(window.location.pathname)}
            disabled={sessionQuery.isError}
          >
            Login 
          </Button>
      }
    </div>
  );
}
              // onClick={handleClick} 
            // startIcon={<GitHubIcon fontSize="small" /> }
