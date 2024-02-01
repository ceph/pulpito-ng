import { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { useLocalStorage } from "usehooks-ts";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Table from '@mui/material/Table';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import { useUserData, useSchedule } from '../../lib/teuthologyAPI';
import { useMutation } from "@tanstack/react-query";

export default function Schedule() {
  const keyOptions =
    [
      "--ceph",
      "--ceph-repo",
      "--suite-repo",
      "--suite-branch",
      "--suite",
      "--subset",
      "--machine",
      "--filter",
      "--distro",
      "--rerun",
      "--rerun-statuses",
      "--limit",
      "--priority",
    ];
  const OptionsInfo = {
    "--ceph": "The ceph branch to run against [default: main]",
    "--ceph-repo": "Query this repository for Ceph branch and \
      SHA1 values [default: https://github.com/ceph/ceph-ci.git]",
    "--suite-repo": "Use tasks and suite definition in this \
      repository [default: https://github.com/ceph/ceph-ci.git]",
    "--suite-branch": "Use this suite branch instead of the ceph branch",
    "--suite": "The suite to schedule",
    "--subset": "Instead of scheduling the entire suite, break the \
    set of jobs into <outof> pieces (each of which will \
      contain each facet at least once) and schedule \
      piece <index>.  Scheduling 0/<outof>, 1/<outof>, \
      2/<outof> ... <outof>-1/<outof> will schedule all \
      jobs in the suite (many more than once). If specified, \
      this value can be found in results.log.",
    "--machine": "Machine type e.g., smithi, mira, gibba.",
    "--filter": "Only run jobs whose description contains at least one \
      of the keywords in the comma separated keyword string specified.",
    "--distro": "Distribution to run against",
    "--rerun": "Attempt to reschedule a run, selecting only those \
    jobs whose status are mentioned by --rerun-status. \
      Note that this is implemented by scheduling an \
      entirely new suite and including only jobs whose \
      descriptions match the selected ones. It does so \
      using the same logic as --filter. \
      Of all the flags that were passed when scheduling \
      the original run, the resulting one will only \
      inherit the --suite value. Any other arguments \
      must be passed again while scheduling. By default, \
      'seed' and 'subset' will be taken from results.log, \
      but can be overide if passed again. \
      This is important for tests involving random facet \
      (path ends with '$' operator).",
    "--rerun-statuses": "A comma-separated list of statuses to be used \
      with --rerun. Supported statuses are: 'dead', \
      'fail', 'pass', 'queued', 'running', 'waiting' \
      [default: fail,dead]",
    "--limit": "Queue at most this many jobs [default: 0]",
    "--priority": "Job priority (lower is sooner) 0 - 1000",
  }

  const [rowData, setRowData] = useLocalStorage("rowData", []);
  const [rowIndex, setRowIndex] = useLocalStorage("rowIndex", -1);
  const [commandBarValue, setCommandBarValue] = useState([]);
  const userData = useUserData();

  const [open, setOpenSuccess] = useState(false);
  const [openErr, setOpenErr] = useState(false);
  const [ErrText, setErrText] = useState("");

  const handleOpenSuccess = () => {
    setOpenSuccess(true);
  };
  const handleOpenErr = (errText) => {
    setErrText(errText);
    setOpenErr(true);
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };
  const handleCloseErr = () => {
    setOpenErr(false);
  };

  const clickRun = useMutation({
    mutationFn: async (commandValue) => {
      return await useSchedule(commandValue);
    },
    onSuccess: () => {
      handleOpenSuccess();
    },
    onError: () => {
      handleOpenErr("Failed to Schedule Run");
    }
  })

  const clickDryRun = useMutation({
    mutationFn: async (commandValue) => {
      return await useSchedule(commandValue);
    },
    onSuccess: () => {
      handleOpenSuccess();
    },
    onError: () => {
      handleOpenErr("Failed to Schedule Dry Run");
    }
  })

  const clickForcePriority = useMutation({
    mutationFn: async (commandValue) => {
      commandValue['--force-priority'] = true;
      return await useSchedule(commandValue);
    },
    onSuccess: () => {
      handleOpenSuccess();
    },
    onError: () => {
      handleOpenErr("Failed to Schedule run with --force-priority");
    }
  })

  useEffect(() => {
    setCommandBarValue(rowData);
  }, [rowData])

  function getCommandValue(dry_run) {
    let retCommandValue = {};
    commandBarValue.map((data) => {
      if (data.checked) {
        retCommandValue[data.key] = data.value;
      }
    })
    let username = userData.get("username");
    if (!username) {
      console.log("User is not logged in");
      return {};
    } else {
      retCommandValue['--user'] = userData.get("username");
    }
    if (dry_run) {
      retCommandValue['--dry-run'] = true;
    } else {
      retCommandValue['--dry-run'] = false;
    }
    return retCommandValue;
  }

  const addNewRow = () => {
    console.log("addNewRow");
    const updatedRowIndex = rowIndex + 1;
    setRowIndex(updatedRowIndex);
    const index = (updatedRowIndex % keyOptions.length);
    const object = {
      key: keyOptions[index],
      value: "",
      lock: false,
      checked: true,
    }
    const updatedRowData = [...rowData];
    updatedRowData.push(object);
    setRowData(updatedRowData);
  };

  const handleCheckboxChange = (index, event) => {
    console.log("handleCheckboxChange");
    const newRowData = [...rowData];
    if (event.target.checked) {
      newRowData[index].checked = true;
    } else {
      newRowData[index].checked = false;
    }
    setRowData(newRowData);
  };

  const handleKeySelectChange = (index, event) => {
    console.log("handleKeySelectChange");
    const newRowData = [...rowData];
    newRowData[index].key = event.target.value;
    setRowData(newRowData);
  };

  const handleValueChange = (index, event) => {
    console.log("handleValueChange");
    const newRowData = [...rowData];
    newRowData[index].value = event.target.value;
    setRowData(newRowData);
  };

  const handleDeleteRow = (index) => {
    console.log("handleDeleteRow");
    let newRowData = [...rowData];
    newRowData.splice(index, 1)
    setRowData(newRowData);
    const updatedRowIndex = rowIndex - 1;
    setRowIndex(updatedRowIndex);
  };

  const toggleRowLock = (index) => {
    console.log("toggleRowLock");
    const newRowData = [...rowData];
    newRowData[index].lock = !newRowData[index].lock;
    setRowData(newRowData);
  };

  return (
    <div>
      <Helmet>
        <title>Schedule - Pulpito</title>
      </Helmet>
      <Typography variant="h5" style={{ paddingBottom: "20px" }}>
        Schedule a run
      </Typography>
      <div style={{ border: "#b4bfa6", display: "flex", paddingBottom: "20px" }}>
        <Tooltip title="Teuthology command that will execute" arrow>
          <TextField // Command Bar
            variant="outlined"
            style={{ width: "100%", height: "50px" }}
            value={`teuthology-suite ${commandBarValue.map((data, index) => {
              if (data.checked) {
                return `${data.key} ${data.value}`;
              }
            })
              .join(" ")}`}
            placeholder="teuthology-suite"
            disabled={true}
          />
        </Tooltip>
        <div style={{ display: "flex", paddingLeft: "20px" }}>
          <Tooltip title="Execute command with regards to the --priority value" arrow>
            <Snackbar open={open} onClose={handleCloseSuccess}>
              <Alert
                onClose={handleCloseSuccess}
                severity="success"
                variant="filled"
                sx={{ width: '100%' }}
              >
                Run Scheduled!
              </Alert>
            </Snackbar>
            {clickRun.isLoading ? (
              <CircularProgress />
            ) : <Button // Run Button
              style={{ height: "50px", width: "100px", backgroundColor: "#33b249", color: "#fff" }}
              variant="contained"
              disabled={clickDryRun.isLoading || clickForcePriority.isLoading}
              onClick={() => {
                clickRun.mutate(getCommandValue(false)
                )
              }}
            >
              Run
            </Button>}
            <Snackbar open={openErr} onClose={handleCloseErr}>
              <Alert
                onClose={handleCloseErr}
                severity="error"
                variant="filled"
                sx={{ width: '100%' }}
              >
                {ErrText}
              </Alert>
            </Snackbar>
          </Tooltip>
          <Tooltip title="Execute command without regards to the --priority value " arrow>
            {clickForcePriority.isLoading ? (
              <CircularProgress />
            ) :
              <Button // Force Priority Button
                style={{ height: "50px", width: "100px", marginLeft: "20px" }}
                variant="contained"
                color="error"
                disabled={clickDryRun.isLoading || clickRun.isLoading}
                onClick={() => {
                  clickForcePriority.mutate(getCommandValue(false))
                }}
              >
                force priority
              </Button>}
          </Tooltip>
          <Tooltip title="Simulate the execution of the command to see what kind of jobs are scheduled, how many there are and etc." arrow>
            {clickDryRun.isLoading ? <CircularProgress /> : (<Button // Dry Run Button
              style={{ height: "50px", width: "100px", backgroundColor: "#1976D2", color: "#fff", marginLeft: "20px" }}
              variant="contained"
              disabled={clickRun.isLoading || clickForcePriority.isLoading}
              onClick={() => {
                clickDryRun.mutate(getCommandValue(true)
                )
              }}
            >
              Dry Run
            </Button>)}
          </Tooltip>
        </div>
      </div>
      <div style={{ paddingBottom: "20px" }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left"></TableCell>
                <TableCell align="left">Key</TableCell>
                <TableCell align="left">Value</TableCell>
                <TableCell align="left"></TableCell>
              </TableRow>
            </TableHead>
            {<TableBody>
              {rowData.map((data, index) => (
                <TableRow
                  key={index}
                  hover={true}
                >
                  <TableCell>
                    <Checkbox
                      style={{ transform: "scale(1.2)" }}
                      type="checkbox"
                      id={`checkbox${index + 1}`}
                      checked={data.checked}
                      onChange={(event) => handleCheckboxChange(index, event)} />
                  </TableCell>
                  <TableCell>
                    <div style={{ display: "flex" }}>
                      <Select
                        value={data.key}
                        onChange={(event) => handleKeySelectChange(index, event)}
                        disabled={data.lock}
                        size="small"
                      >
                        {keyOptions.map((option, optionIndex) => (
                          <MenuItem
                            key={optionIndex}
                            value={option}
                          >
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      <Tooltip
                        title={OptionsInfo[data.key]}
                        arrow
                        style={{ marginLeft: "10px", marginTop: "5px" }}
                      >
                        <InfoIcon></InfoIcon>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TextField
                      required
                      error={data.value <= 0 & data.checked}
                      label="Required"
                      variant="outlined"
                      size="small"
                      value={data.value}
                      onChange={(event) => handleValueChange(index, event)}
                      disabled={data.lock}
                    />
                  </TableCell>
                  <TableCell>
                    <div style={{ display: "flex" }}>
                      <Tooltip title={data.lock ? "Unlock" : "Lock"} arrow>
                        <div
                          style={{ cursor: "pointer", color: "#888" }}
                          onClick={() => toggleRowLock(index)}
                        >
                          {data.lock ? <LockIcon /> : <LockOpenIcon />}
                        </div>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <div
                          style={{ cursor: "pointer", color: "#888" }}
                          onClick={() => {
                            handleDeleteRow(index);
                          }}
                        >
                          <DeleteIcon />
                        </div>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>}
          </Table>
        </TableContainer>
      </div>
      <Tooltip title="Add" arrow>
        <Fab
          disabled={!keyOptions.length}
          style={{ backgroundColor: "#1976D2", color: "#fff", float: "right" }}
          onClick={addNewRow}>
          <AddIcon
          >
          </AddIcon>
        </Fab >
      </Tooltip>
    </div >
  );
}
