import { useData } from 'vike-react/useData'
import { Config } from 'vike-react/Config'
import Typography from "@mui/material/Typography";

import NodeList from "../../components/NodeList";
import type { NodesResponse } from "./+data"


export default function Nodes() {
  const data = useData<NodesResponse>();
  return (
    <div>
      <Config title="Nodes - Pulpito" />
      <Typography variant="h5" style={{ margin: "20px" }}>
        Nodes
      </Typography>
      <NodeList
        nodes={data.nodes}
      />
    </div>
  );
}
