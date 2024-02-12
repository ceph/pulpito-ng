import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { KillRunPayload } from "../../lib/teuthologyAPI.d";
import { useSession } from "../../lib/teuthologyAPI";
import Alert from "../Alert";


type KillButtonProps = {
  mutation: UseMutationResult;
  text: string;
  payload: KillRunPayload;
  disabled?: boolean;
};

type KillButtonDialogProps = {
  mutation: UseMutationResult;
  payload: KillRunPayload;
  open: boolean;
  handleClose: () => void;
};

export default function KillButton(props: KillButtonProps) {
  const [open, setOpen] = useState(false);
  const mutation: UseMutationResult = props.mutation;
  const sessionQuery = useSession();
  const loggedUser = sessionQuery.data?.session.username;

  if (loggedUser?.toLowerCase() != props.payload["--owner"].toLowerCase()) {
    // logged user and owner of the job should be equal (case insensitive)
    return null
  }

  const toggleDialog = () => {
    setOpen(!open);
  };
  

  return (
  <div>
      <div style={{ display: "flex" }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={toggleDialog}
          disabled={(props.disabled || mutation.isLoading)}
        >
          {props.text}
        </Button>
        <KillButtonDialog
          mutation={mutation}
          payload={props.payload}
          open={open}
          handleClose={toggleDialog}
        />
      </div>
      { (mutation.isError) ? <Alert severity="error" message="Unable to kill run" /> : null }     
      { (mutation.isSuccess) ? <Alert severity="success" message={`Run killed successfully! \n`} /> : null }
  </div>
  );
};

function KillButtonDialog({mutation, open, handleClose, payload}: KillButtonDialogProps) {
  return (
    <div>
      <Dialog onClose={handleClose} open={open} scroll="paper" fullWidth={true} maxWidth="sm">
        <DialogTitle>Kill confirmation</DialogTitle>
        <DialogContent>
          { (mutation.data && mutation.data.data ) ? 
            <div>
            <Typography variant="h6" display="block" gutterBottom>
              {mutation.isSuccess ? "Successful!": "Failed!"}
            </Typography>
            <Paper>
              <Typography variant="caption" display="block" gutterBottom>
                {mutation.data.data.logs}
              </Typography>
            </Paper>
            </div> : 
            (mutation.isLoading) ? (
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle1" display="block" gutterBottom>
                  <CircularProgress size={20} color="inherit" />
                  Killing run...
                </Typography>
              </Box>
            ) : 
            <div>
              <Typography variant="overline" display="block" gutterBottom>
                Are you sure you want to kill this run/job?
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="large"
                onClick={() => mutation.mutate(payload)}
              >
                Yes, I'm sure
              </Button>
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>
  ) 
}
