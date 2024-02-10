import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { Config } from 'vike-react/Config'

import Typography from "@mui/material/Typography";

import JobList from "#src/components/JobList";
import NodeList from "#src/components/NodeList";

import { type NodeResponse } from "./+data"

export default function Node() {
  const data = useData<NodeResponse>();
  const context = usePageContext();
  const name = context.routeParams.name;
  return (
    <div>
      <Config title={`${name} - Pulpito`} />
      <Typography variant="h6" style={{ marginBottom: "20px" }}>
        Node: {name}
      </Typography>

      <div>
        <div>
          <NodeList nodes={data.nodes}/>
          <JobList sortMode={"time"} />
        </div>
      </div>
    </div>
  );
}
