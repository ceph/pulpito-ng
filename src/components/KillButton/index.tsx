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
import Tooltip from '@mui/material/Tooltip';

import CodeBlock from "../CodeBlock";
import { KillRunPayload } from "../../lib/teuthologyAPI.d";
import { useSession } from "../../lib/teuthologyAPI";
import Alert from "../Alert";


type KillButtonProps = {
  mutation: UseMutationResult;
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
  const loggedUser = sessionQuery.data?.session?.username;
  const isUserAdmin = sessionQuery.data?.session?.isUserAdmin;
  const owner = props.payload["--owner"].toLowerCase()
  const isOwner = (loggedUser?.toLowerCase() == owner) || (`scheduled_${loggedUser?.toLowerCase()}@teuthology` == owner)
  const isButtonDisabled = ((props.disabled) || (!isOwner && !isUserAdmin))

  const getHelperMessage = () => {
    if (isButtonDisabled) {
      if (!isOwner && !isUserAdmin) return "You don't have admin privileges to kill runs owned by another user. ";
      return "All jobs in the run have already finished";
    } else {
      if (!isOwner && isUserAdmin) return "Use admin privileges to kill another user's run.";
      return "Terminate all jobs in this run";
    }
  }

  const toggleDialog = () => {
    setOpen(!open);
  };

  const refreshAndtoggle = () => {
    toggleDialog();
    mutation.reset();
  }
  

  return (
  <div>
      <div style={{ display: "flex" }}>
      <Tooltip arrow title={getHelperMessage()}>
        <span>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={refreshAndtoggle}
          disabled={isButtonDisabled}
          sx={{ marginBottom: "12px" }}
        >
          {(isOwner) ? "Kill Run" : "Kill Run As Admin"}
        </Button>
        </span>
      </Tooltip>
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
      <Dialog onClose={handleClose} open={open} scroll="paper" fullWidth={true} maxWidth="md">
        <DialogTitle variant="h6">KILL CONFIRMATION</DialogTitle>
        <DialogContent dividers>
          { (mutation.isSuccess && mutation.data ) ? 
            <div>
              <Typography variant="h6" display="block" color="green" gutterBottom>
                Successful!
              </Typography>
              <Paper>
                <CodeBlock value={mutation.data?.data?.logs || ""} language="python" />
              </Paper>
            </div> : 
            (mutation.isLoading) ? (
              <div style={{display: "flex", alignItems: "center"}}>
                <CircularProgress size={20} color="inherit" style={{marginRight: "12px"}} />
                <Typography variant="subtitle1" display="block">
                  Killing run...
                </Typography>
              </div>
            ) : 
            (mutation.isError) ? (
              <div>
                <Typography variant="h6" display="block" color="red" gutterBottom>
                  Failed!
                </Typography>
                <Paper>
                  <CodeBlock value={(mutation.error?.response?.data?.detail) || ""} language="python" />
                </Paper>
              </div>
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
