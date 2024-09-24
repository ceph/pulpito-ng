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
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
export default function Schedule() {
  const keyOptions =
    [
      "--ceph",
      "--ceph-repo",
      "--suite-repo",
      "--suite-branch",
      "--suite",
      "--subset",
      "--sha1",
      "--email",
      "--machine-type",
      "--filter",
      "--filter-out",
      "--filter-all",
      "--kernal",
      "--flavor",
      "--distro",
      "--distro-version",
      "--newest",
      "--num",
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
    "--sha1": "The ceph sha1 to run against (overrides -c) \
      If both -S and -c are supplied, -S wins, and \
      there is no validation that sha1 is contained \
      in branch",
    "--email": "When tests finish or time out, send an email \
      here. May also be specified in ~/.teuthology.yaml \
      as 'results_email'",
    "--machine-type": "Machine type e.g., smithi, mira, gibba.",
    "--filter": "Only run jobs whose description contains at least one \
      of the keywords in the comma separated keyword string specified.",
    "--filter-out": "Do not run jobs whose description contains any of \
      the keywords in the comma separated keyword \
      string specified.",
    "--filter-all": "Only run jobs whose description contains each one \
      of the keywords in the comma separated keyword \
      string specified.",
    "--kernal": "The kernel branch to run against, \
      use 'none' to bypass kernel task. \
      [default: distro]",
    "--flavor": "The ceph packages shaman flavor to run with: \
      ('default', 'crimson', 'notcmalloc', 'jaeger') \
      [default: default]",
    "--distro": "Distribution to run against",
    "--distro-version": "Distro version to run against",
    "--newest": "Search for the newest revision built on all \
      required distro/versions, starting from \
      either --ceph or --sha1, backtracking \
      up to <newest> commits [default: 0]",
    "--num": "Number of times to run/queue the job [default: 1]",
    "--limit": "Queue at most this many jobs [default: 0]",
    "--priority": "Job priority (lower is sooner) 0 - 1000",
  }

  const [rowData, setRowData] = useLocalStorage("rowData", []);
  const [rowIndex, setRowIndex] = useLocalStorage("rowIndex", -1);
  const [commandBarValue, setCommandBarValue] = useState([]);
  const username = useUserData().get("username");

  const [open, setOpenSuccess] = useState(false);
  const [openWrn, setOpenWrn] = useState(false);
  const [openErr, setOpenErr] = useState(false);
  const [logText, setLogText] = useLocalStorage("logText", "");

  const handleOpenSuccess = (data) => {
    if (data && data.data) {
      const code = data.data.logs.join("");
      setLogText(code);
    }

    if (data.data.job_count < 1) {
      setOpenWrn(true)
    } else {
      setOpenSuccess(true);
    }
  };
  const handleOpenErr = (data) => {
    console.log("handleOpenErr");
    if (data && data.response.data.detail) {
      const code = data.response.data.detail;
      setLogText(code);
    }
    setOpenErr(true);
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };
  const handleCloseErr = () => {
    setOpenErr(false);
  };
  const handleCloseWrn = () => {
    setOpenWrn(false);
  };
  const clickRun = useMutation({
    mutationFn: async (commandValue) => {
      return await useSchedule(commandValue);
    },
    onSuccess: (data) => {
      handleOpenSuccess(data);
    },
    onError: (err) => {
      console.log(err);
      handleOpenErr(err);
    }
  })

  const clickDryRun = useMutation({
    mutationFn: async (commandValue) => {
      return await useSchedule(commandValue);
    },
    onSuccess: (data) => {
      handleOpenSuccess(data);
    },
    onError: (err) => {
      handleOpenErr(err);
    }
  })

  const clickForcePriority = useMutation({
    mutationFn: async (commandValue) => {
      commandValue['--force-priority'] = true;
      return await useSchedule(commandValue);
    },
    onSuccess: (data) => {
      handleOpenSuccess(data);
    },
    onError: (err) => {
      handleOpenErr(err);
    }
  })

  useEffect(() => {
    setCommandBarValue(rowData);
  }, [rowData])

  function getCommandValue(dry_run) {
    setLogText("");
    let retCommandValue = {};
    commandBarValue.map((data) => {
      if (data.checked) {
        retCommandValue[data.key] = data.value;
      }
    })
    if (!username) {
      console.log("User is not logged in");
      return {};
    } else {
      retCommandValue['--user'] = username;
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
      {username ? <></> : <Alert variant="filled" severity="error">User is not logged in ... feature disabled.</Alert>}
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
          <Snackbar open={open} onClose={handleCloseSuccess}>
            <Alert
              onClose={handleCloseSuccess}
              severity="success"
              variant="filled"
              sx={{ width: '100%' }}
            >
              Schedule Success!
            </Alert>
          </Snackbar>
          <Snackbar open={openErr} onClose={handleCloseErr}>
            <Alert
              onClose={handleCloseErr}
              severity="error"
              variant="filled"
              sx={{ width: '100%' }}
            >
              Schedule Failed!
            </Alert>
          </Snackbar>
          <Snackbar open={openWrn} onClose={handleCloseWrn}>
            <Alert
              onClose={handleCloseWrn}
              severity="warning"
              variant="filled"
              sx={{ width: '100%' }}
            >
              Warning! 0 Jobs Scheduled
            </Alert>
          </Snackbar>
          <Tooltip title="Execute command with regards to the --priority value" arrow>
            {clickRun.isLoading ? (
              <CircularProgress />
            ) : <Button // Run Button
              style={{ height: "50px", width: "100px" }}
              variant="contained"
              color="success"
              disabled={clickDryRun.isLoading || clickForcePriority.isLoading || !username}
              onClick={() => {
                clickRun.mutate(getCommandValue(false)
                )
              }}
            >
              Run
            </Button>}
          </Tooltip>
          <Tooltip title="Execute command without regards to the --priority value " arrow>
            {clickForcePriority.isLoading ? (
              <CircularProgress />
            ) :
              <Button // Force Priority Button
                style={{ height: "50px", width: "100px", marginLeft: "20px" }}
                variant="contained"
                color="error"
                disabled={clickDryRun.isLoading || clickRun.isLoading || !username}
                onClick={() => {
                  clickForcePriority.mutate(getCommandValue(false))
                }}
              >
                force priority
              </Button>}
          </Tooltip>
          <Tooltip title="Simulate the execution of the command to see what kind of jobs are scheduled, how many there are and etc." arrow>
            {clickDryRun.isLoading ? <CircularProgress /> : (<Button // Dry Run Button
              style={{ height: "50px", width: "100px", marginLeft: "20px" }}
              variant="contained"
              color="primary"
              disabled={clickRun.isLoading || clickForcePriority.isLoading || !username}
              onClick={async () => {
                clickDryRun.mutate(getCommandValue(true));
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
      <Accordion
        TransitionProps={{ unmountOnExit: true }}
        style={{ marginTop: "20px" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Logs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {clickDryRun.isLoading | clickRun.isLoading | clickForcePriority.isLoading ? <CircularProgress /> : <Editor
            value={logText}
            readOnly={true}
            highlight={(logText) => highlight(logText, languages.yaml)}
            style={{
              fontFamily: [
                "ui-monospace",
                "SFMono-Regular",
                '"SF Mono"',
                "Menlo",
                "Consolas",
                "Liberation Mono",
                '"Lucida Console"',
                "Courier",
                "monospace",
              ].join(","),
              textAlign: "initial",
            }}
          />}
        </AccordionDetails>
      </Accordion>
    </div >
  );
}
