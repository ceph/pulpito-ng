import type { UseMutationResult } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { CircularProgress } from "@mui/material";

import { KillRun } from "../../lib/teuthologyAPI.d";
import Alert from "../Alert";


type KillButtonProps = {
  mutation: UseMutationResult;
  text: string;
  payload: KillRun;
};


export default function KillButton(props: KillButtonProps) {
  const mutation: UseMutationResult = props.mutation;
  

  return (
  <div>
      <div style={{ display: "flex" }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => mutation.mutate(props.payload)}
          disabled={(mutation.isLoading)}
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
