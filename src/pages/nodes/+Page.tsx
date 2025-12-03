import { useData } from 'vike-react/useData'
import { Config } from 'vike-react/Config'
import { usePageContext } from 'vike-react/usePageContext'
import Typography from "@mui/material/Typography";

import FilterAutocomplete from "#src/components/FilterAutocomplete";
import NodeList from "../../components/NodeList";
import { MACHINE_TYPES } from '#src/lib/paddles';
import type { NodesResponse } from "./+data"


export default function Nodes() {
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  const machine_type = params.machine_type || "";
  const data = useData<NodesResponse>();
  return (
    <div>
      <Config title="Nodes - Pulpito" />
      <Typography variant="h5" style={{ margin: "20px" }}>
        Nodes
      </Typography>
      <div style={{ height: "auto", display: "flex" }}>
        <div style={{ display: "flex", flexWrap: "wrap", marginLeft: "auto" }}>
          <FilterAutocomplete
            type="machine_type"
            value={machine_type}
            baseUrl="/nodes/"
            options={MACHINE_TYPES}
          />
        </div>
      </div>
      <NodeList nodes={data.nodes}/>
    </div>
  );
}
