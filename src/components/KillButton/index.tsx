import { useState } from "react";
import { Button, Loader, Modal, Paper, Text, Title, Tooltip } from "@mantine/core";

import CodeBlock from "../CodeBlock";
import type { Run as RunResponse } from "../../lib/paddles.d";
import type { KillRunPayload } from "../../lib/teuthologyAPI.d";
import { useSession, useRunKill } from "../../lib/teuthologyAPI";
import Alert from "../Alert";


type KillButtonProps = {
  data: RunResponse;
};

type KillButtonDialogProps = {
  mutation: ReturnType<typeof useRunKill>;
  payload: KillRunPayload;
  open: boolean;
  handleClose: () => void;
};

export default function KillButton({data}: KillButtonProps) {
  const killMutation = useRunKill();
  const [open, setOpen] = useState(false);
  const sessionQuery = useSession();
  const run_owner = data?.jobs?.[0]?.owner || "";
  const killPayload: KillRunPayload = {
    "--run": data?.name || "",
    "--owner": run_owner,
    "--machine-type": data?.machine_type || "",
    "--preserve-queue": true,
  }
  const loggedUser = sessionQuery.data?.session?.username;
  const isUserAdmin = !!sessionQuery.data?.session?.isUserAdmin;
  const owner = killPayload["--owner"].toLowerCase()
  const isOwner = (loggedUser?.toLowerCase() === owner) || (`scheduled_${loggedUser?.toLowerCase()}@teuthology` === owner)
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
    if ( killMutation.isSuccess ) {
      // show the run's new state
      window.location.reload();
      return;
    }
    toggleDialog();
    killMutation.reset();
  }

  if ((data?.status?.includes("finished")) || !(sessionQuery.data?.session?.username)) {
    // run finished or user logged out
    return null;
  }


  return (
  <div>
      <div style={{ display: "flex" }}>
      <Tooltip withArrow label={getHelperMessage()}>
        <span>
        <Button
          variant="filled"
          color="red"
          size="lg"
          className="dangerButton"
          onClick={refreshAndtoggle}
          disabled={isButtonDisabled}
          style={{ marginBottom: "12px" }}
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
      <Modal onClose={handleClose} opened={open} size="xl" title="KILL CONFIRMATION">
          { (mutation.isSuccess && mutation.data ) ?
            <div>
              <Title order={3} c="green" mb="sm">
                Successful!
              </Title>
              <Paper withBorder>
                <CodeBlock value={mutation.data.logs || ""} language="python" />
              </Paper>
            </div> :
            (mutation.isPending) ? (
              <div style={{display: "flex", alignItems: "center"}}>
                <Loader size="xs" color="inherit" style={{marginRight: "12px"}} />
                <Text size="md">
                  Killing run...
                </Text>
              </div>
            ) :
            (mutation.isError) ? (
              <div>
                <Title order={3} c="red" mb="sm">
                  Failed!
                </Title>
                <Paper withBorder>
                  <CodeBlock value={(mutation.error?.message) || ""} language="python" />
                </Paper>
              </div>
            ) :
            <div>
              <Text size="xs" tt="uppercase" mb="sm">
                Are you sure you want to kill this run/job?
              </Text>
              <Button
                variant="filled"
                color="red"
                size="lg"
                className="dangerButton"
                onClick={() => mutation.mutate(payload)}
              >
                Yes, I'm sure
              </Button>
            </div>
          }
      </Modal>
    </div>
  )
}
