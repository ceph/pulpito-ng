import { PropsWithChildren } from 'react'
import { Config } from 'vike-react/Config'
import { usePageContext } from 'vike-react/usePageContext'
import { useData } from 'vike-react/useData'
import { Text } from '@mantine/core';
import { format } from "date-fns";

import type { Run } from "#src/lib/paddles.d";

import JobList from "#src/components/JobList";

type FilterLinkProps = {
  to: string
}

const FilterLink = (props: PropsWithChildren<FilterLinkProps>) => (
  <a className="filterLink" href={props.to}>
    {props.children}
  </a>
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
    <div>
      <Config title={`${name} - Pulpito`} />
      <Text size="xl" style={{ margin: "20px 0px" }}>
        {name}
      </Text>
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
      <JobList />
    </div>
  );
}
