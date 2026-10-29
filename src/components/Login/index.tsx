import { Avatar, Button, Menu } from "@mantine/core";

import { doLogin, doLogout, useSession } from "../../lib/teuthologyAPI";


export default function Login() {
  const sessionQuery = useSession();

  if ( ! sessionQuery.isSuccess ) return null;

  return (
    <div>
      {sessionQuery.data?.session
        ? <div>
            <Menu>
              <Menu.Target>
                <Avatar
                  component="button"
                  alt={sessionQuery.data?.session?.username || ""}
                  src={sessionQuery.data?.session?.avatar_url || ""}
                  style={{ cursor: "pointer" }}
                />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={doLogout}>Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
        </div>
        : <Button 
            variant="contained" 
            color="success"
            onClick={doLogin}
            disabled={sessionQuery.isError}
          >
            Login 
          </Button>
      }
    </div>
  );
}
