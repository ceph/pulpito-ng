import { PropsWithChildren } from 'react'
import { Config } from 'vike-react/Config'
import { usePageContext } from 'vike-react/usePageContext'
import { useData } from 'vike-react/useData'
import { Text } from '@mantine/core';

import type { Run } from "#src/lib/paddles.d";

import JobList from "#src/components/JobList";
import KillButton from "#src/components/KillButton";

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
  const date = data.scheduled?.slice(0, 10);
  const runsLink = (params: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    for ( const [key, value] of Object.entries(params) ) {
      if ( value ) search.set(key, value);
    }
    return `/runs?${search}`;
  };
  return (
    <div>
      <Config title={`${name} - Pulpito`} />
      <Text size="xl" style={{ margin: "20px 0px" }}>
        {name}
      </Text>
      <div style={{ margin: "20px 0px" }}>
        See runs with the same:
        <FilterLink to={runsLink({branch})}>
            branch
        </FilterLink>
        <FilterLink to={runsLink({suite, branch})}>
            suite and branch
        </FilterLink>
        { date ? (
        <FilterLink to={runsLink({date})}>
          date
        </FilterLink>
        ) : null }
      </div>
      <KillButton data={data} />
      <JobList />
    </div>
  );
}
