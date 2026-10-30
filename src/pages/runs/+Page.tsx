import { Config } from 'vike-react/Config'
import { usePageContext } from 'vike-react/usePageContext'
import { Title } from "@mantine/core";

import RunList from "#src/components/RunList";

export default function Page() {
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  return (
    <div>
      <Config title="Runs - Pulpito" />
      <Title order={2} style={{ margin: "20px" }}>
        Runs
      </Title>
      <RunList params={params} pagination={true} />
    </div>
  );
}
