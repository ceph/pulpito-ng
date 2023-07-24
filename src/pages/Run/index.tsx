import { useQueryParams, StringParam, NumberParam } from "use-query-params";
import { styled, useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import { format } from "date-fns";
import SourceBranch from "mdi-material-ui/SourceBranch";
import { Helmet } from "react-helmet";

import type { Run, RunParams } from "../../lib/paddles.d";

import { useRun } from "../../lib/paddles";
import JobList from "../../components/JobList";
import Link from "../../components/Link";

const PREFIX = "index";

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    "& .MuiButton-root": {
      textTransform: "none",
    },
  },
}));

export default function Run() {
  const theme = useTheme();
  const [params, setParams] = useQueryParams({
    status: StringParam,
    page: NumberParam,
    pageSize: NumberParam,
  });
  const [kill, setKill] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const killRun = async () => {
    setKill(true);
    const response = await fetch("https://reqres.in/api/users/2?delay=3"); // success response
    // const response = await fetch("https://reqres.in/api/users/23?delay=3"); // error response
    const status = response.status;
    if (status === 200) setSuccess(true);
    else setError(true);
    setKill(false);
  };
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccess(false);
    setError(false);
  };
  const { name } = useParams<RunParams>();
  const query = useRun(name === undefined ? "" : name);
  if (query === null) return <Typography>404</Typography>;
  if (query.isError) return null;
  const data: Run | undefined = query.data;
  const suite = data?.suite;
  const branch = query.data?.branch;
  const statuses = ["pass", "fail", "dead", "running", "waiting"];
  const date = query.data?.scheduled
    ? format(new Date(query.data.scheduled), "yyyy-MM-dd")
    : null;
  return (
    <Root className={classes.root}>
      <Helmet>
        <title>{`${name} - Pulpito`}</title>
      </Helmet>
      <Typography variant="h5" style={{ margin: "20px 0px" }}>
        {name}
      </Typography>
      <div style={{ margin: "20px 0px" }}>
        <Typography>See similar runs:</Typography>
        <Link to={`/runs/?suite=${suite}&branch=${branch}`}>
          <Typography>
            suite {suite} and branch {branch}
          </Typography>
        </Link>
        <Link to={`/runs/?branch=${branch}`}>
          <Typography>
            <SourceBranch style={{ color: theme.palette.text.primary }} />
          </Typography>
        </Link>
        <Link to={`/runs/?date=${date}`}>
          <Typography>scheduled on {date}</Typography>
        </Link>
      </div>
      <div
        style={{
          display: "flex",
        }}
      >
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={killRun}
        >
          Kill Run
        </Button>
        {kill ? (
          <Box sx={{ p: 1 }}>
            <CircularProgress size={20} color="inherit" />
          </Box>
        ) : null}
      </div>
      <Snackbar autoHideDuration={3000} open={success} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Run killed successfully
        </Alert>
      </Snackbar>
      <Snackbar autoHideDuration={3000} open={error} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          Unable to kill run
        </Alert>
      </Snackbar>
      <ButtonGroup style={{ display: "flex", justifyContent: "center" }}>
        <Button
          onClick={() => {
            setParams({ status: null });
          }}
          variant={params.status ? "outlined" : "contained"}
        >
          All
        </Button>
        {statuses.map((item) => (
          <Button
            key={item}
            onClick={() => {
              setParams({ status: item });
            }}
            variant={params.status === item ? "contained" : "outlined"}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </ButtonGroup>
      <JobList query={query} params={params} setter={setParams} />
    </Root>
  );
}
