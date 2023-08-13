import { PropsWithChildren } from 'react'
import { useQueryParams, StringParam, NumberParam } from "use-query-params";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import { Helmet } from "react-helmet";

import type { Run as Run_, RunParams } from "../../lib/paddles.d";

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

type FilterLinkProps = {
  to: string
}

const FilterLink = (props: PropsWithChildren<FilterLinkProps>) => (
  <Link sx={{mx: 0.33}} to={props.to}>
    {props.children}
  </Link>
);

export default function Run() {
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
    // Using a mock API endpoint for testing
    const response = await fetch("https://reqres.in/api/users/2?delay=3");
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
  const data: Run_ | undefined = query.data;
  const suite = data?.suite;
  const branch = query.data?.branch;
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
        See runs with the same:
        <FilterLink to={`/runs/?branch=${branch}`}>
            branch
        </FilterLink>
        <FilterLink to={`/runs/?suite=${suite}&branch=${branch}`}>
            suite and branch
        </FilterLink>
        <FilterLink to={`/runs/?date=${date}`}>
          date
        </FilterLink>
      </div>
      <JobList query={query} params={params} setter={setParams} />
    </Root>
  );
}
