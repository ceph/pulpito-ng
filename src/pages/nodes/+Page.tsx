import { useData } from 'vike-react/useData'
import { Config } from 'vike-react/Config'
import { Title } from "@mantine/core";

import NodeList from "../../components/NodeList";
import type { NodesResponse } from "./+data"


export default function Nodes() {
  const data = useData<NodesResponse>();
  return (
    <div>
      <Config title="Nodes - Pulpito" />
      <Title order={2} style={{ margin: "20px" }}>
        Nodes
      </Title>
      <NodeList
        nodes={data.nodes}
      />
    </div>
  );
}
