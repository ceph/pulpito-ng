import type { UseMutationResult } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { CircularProgress } from "@mui/material";

import { KillRunPayload } from "../../lib/teuthologyAPI.d";
import { useSession } from "../../lib/teuthologyAPI";
import Alert from "../Alert";


type KillButtonProps = {
  mutation: UseMutationResult;
  text: string;
  payload: KillRunPayload;
  disabled?: boolean;
};


export default function KillButton(props: KillButtonProps) {
  const mutation: UseMutationResult = props.mutation;
  const sessionQuery = useSession();
  const loggedUser = sessionQuery.data?.session.username;

  if (loggedUser?.toLowerCase() != props.payload["--user"].toLowerCase()) {
    // logged user and owner of the job should be equal (case insensitive)
    return null
  }

  return (
  <div>
      <div style={{ display: "flex" }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => mutation.mutate(props.payload)}
          disabled={(props.disabled || mutation.isLoading)}
        >
          {props.text}
        </Button>
        {(mutation.isLoading) ? (
          <Box sx={{ p: 1 }}>
            <CircularProgress size={20} color="inherit" />
          </Box>
        ) : null}
      </div>
      { (mutation.isError) ? <Alert severity="error" message="Unable to kill run" /> : null }     
      { (mutation.isSuccess) ? <Alert severity="success" message="Run killed successfully" /> : null }
  </div>
  );
};
