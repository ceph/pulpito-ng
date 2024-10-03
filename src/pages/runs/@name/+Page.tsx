import { PropsWithChildren } from 'react'
import { Config } from 'vike-react/Config'
import { usePageContext } from 'vike-react/usePageContext'
import { useData } from 'vike-react/useData'
import Typography from "@mui/material/Typography";
import { format } from "date-fns";

import type { Run } from "#src/lib/paddles.d";

import JobList from "#src/components/JobList";
import KillButton from "#src/components/KillButton";
import Link from "#src/components/Link";

const PREFIX = "index";

const classes = {
  root: `${PREFIX}-root`,
};

type FilterLinkProps = {
  to: string
}

const FilterLink = (props: PropsWithChildren<FilterLinkProps>) => (
  <Link sx={{mx: 0.33}} to={props.to}>
    {props.children}
  </Link>
);

export default function Page() {
  const context = usePageContext();
  const name = context.routeParams.name;
  const data: Run = useData();
  const suite = data.suite;
  const branch = data.branch;
  const date = data.scheduled
    ? format(new Date(data.scheduled), "yyyy-MM-dd")
    : null;
  return (
    <div className={classes.root}>
      <Config title={`${name} - Pulpito`} />
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
      <KillButton data={data} />
      <JobList />
    </div>
  );
}
