import { useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";

import FilterMenu from "../../components/FilterMenu";
import NodeList from "../../components/NodeList";

import { useMachineTypes } from "../../lib/paddles";
import { useNodes } from "../../lib/paddles";


export default function Nodes() {
  const [params, setParams] = useSearchParams({
    machine_type: "",
  });
  const machine_type = params.get("machine_type");
  const query = useNodes(machine_type || "");
  if (query.isError) return null;

 
  return (
    <div>
      <Helmet>
        <title>Nodes - Pulpito</title>
      </Helmet>
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
          <FilterMenu
            type="machine_type"
            value={machine_type}
            setter={setParams}
            optionsHook={useMachineTypes}
            width={150}
          />
        </div>
      </div>
      <NodeList query={query} />
    </div>
  );
}
