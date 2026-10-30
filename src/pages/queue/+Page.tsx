import { Config } from 'vike-react/Config'
import { Title } from "@mantine/core";

import RunList from "#src/components/RunList";


export default function Page() {
  return (
    <div>
      <Config title="Queue - Pulpito" />
      <Title order={2} style={{ margin: "20px" }}>
        Queue
      </Title>
      <RunList params={{}} pagination={false} filters={false} />
    </div>
  );
}

