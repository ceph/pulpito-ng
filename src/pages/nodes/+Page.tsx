import { useData } from 'vike-react/useData'
import { Config } from 'vike-react/Config'

import Typography from "@mui/material/Typography";

import MachineTypeSelector from "#src/components/MachineTypeSelector";
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
      <div style={{ height: "auto", display: "flex" }}>
        <div style={{ display: "flex", flexWrap: "wrap", marginLeft: "auto" }}>
          <div>
            <Typography style={{ padding: "10px" }}>
              Filter&nbsp;by:
            </Typography>
          </div>
          <MachineTypeSelector />
        </div>
      </div>
      <NodeList nodes={data.nodes}/>
    </div>
  );
}
