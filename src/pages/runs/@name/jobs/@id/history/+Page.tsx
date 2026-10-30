import { Config } from 'vike-react/Config'
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { Text, Title } from '@mantine/core';

import JobList from '#src/components/JobList';
import Link from '#src/components/Link';

export default function JobHistoryPage () {
  const { name, id } = usePageContext().routeParams;
  const { description } = useData<{ description: string }>();
  return (
    <div>
      <Config title={`Job ${id} history - Pulpito`} />
      <Title order={2} style={{ margin: "20px 0px" }}>
        Past jobs like{' '}
        <Link to={`/runs/${encodeURIComponent(name)}/jobs/${encodeURIComponent(id)}`}>
          {name}/{id}
        </Link>
      </Title>
      <Text component="div" style={{ marginBottom: "20px" }}>
        Description: <code>{description}</code>
      </Text>
      <JobList sortMode="time" />
    </div>
  )
}
