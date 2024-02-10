import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";

import JobList from "../../components/JobList";
import NodeList from "../../components/NodeList";
import type { NodeParams } from "../../lib/paddles.d";

import { useNode, useNodeJobs } from "../../lib/paddles";

export default function Node() {
  const [params, _] = useSearchParams({
    page: "",
    pageSize: "",
  });
  const { name } = useParams<NodeParams>();
  const detailsQuery = useNode(name === undefined ? "" : name);
  const jobsQuery = useNodeJobs(name === undefined ? "" : name, params);

  if (detailsQuery === null) return <Typography>404</Typography>;
  if (detailsQuery.isError) return null;

  if (jobsQuery === null) return <Typography>404</Typography>;
  if (jobsQuery.isError) return null;
  
  return (
    <div>
      <Helmet>
        <title>Node - Pulpito</title>
      </Helmet>
      <Typography variant="h6" style={{ marginBottom: "20px" }}>
        Node: {name}
      </Typography>

      <div>
        <div>
          <NodeList query={detailsQuery} />
          <JobList query={jobsQuery} sortMode={"time"} />
        </div>
      </div>
    </div>
  );
}
