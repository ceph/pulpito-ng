import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tooltip from '@mui/material/Tooltip';

import CodeBlock from "../CodeBlock";
import type { Run as RunResponse } from "../../lib/paddles.d";
import { KillRunPayload, KillRunResult } from "../../lib/teuthologyAPI.d";
import { useSession, useRunKill } from "../../lib/teuthologyAPI";
import Alert from "../Alert";


type KillButtonProps = {
  data: RunResponse;
};

type KillButtonDialogProps = {
  mutation: UseMutationResult<KillRunResult>;
  payload: KillRunPayload;
  open: boolean;
  handleClose: () => void;
};

export default function KillButton({data}: KillButtonProps) {
  const killMutation = useRunKill();
  const [open, setOpen] = useState(false);
  const sessionQuery = useSession();
  const run_owner = data?.jobs[0].owner || "";
  const killPayload: KillRunPayload = {
    "--run": data?.name || "",
    "--owner": run_owner,
    "--machine-type": data?.machine_type || "",
    "--preserve-queue": true,
  }
  const loggedUser = sessionQuery.data?.session?.username;
  const isUserAdmin = sessionQuery.data?.session?.isUserAdmin;
  const owner = killPayload["--owner"].toLowerCase()
  const isOwner = (loggedUser?.toLowerCase() == owner) || (`scheduled_${loggedUser?.toLowerCase()}@teuthology` == owner)
  const isButtonDisabled = (!isOwner && !isUserAdmin)

  const getHelperMessage = () => {
    if (isButtonDisabled) {
      return `User (${loggedUser}) does not have admin privileges to kill runs owned by another user (${owner}). `;
    } else {
      if (!isOwner && isUserAdmin) return `Use admin privileges to kill run owned by '${owner}'. `;
      return "Terminate all jobs in this run";
    }
  }

  const toggleDialog = () => {
    setOpen(!open);
  };

  const refreshAndtoggle = () => {
    toggleDialog();
    killMutation.reset();
  }

  if ((data?.status.includes("finished")) || !(sessionQuery.data?.session?.username)) {
    // run finished or user logged out
    return null;
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
          mutation={killMutation}
          payload={killPayload}
          open={open}
          handleClose={refreshAndtoggle}
        />
      </div>
      { (killMutation.isError) ? <Alert severity="error" message="Unable to kill run" /> : null }
      { (killMutation.isSuccess) ? <Alert severity="success" message={`Run killed successfully! \n`} /> : null }
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
                <CodeBlock value={mutation.data.logs || ""} language="python" />
              </Paper>
            </div> :
            (mutation.isPending) ? (
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
                  <CodeBlock value={(mutation.error?.message) || ""} language="python" />
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
