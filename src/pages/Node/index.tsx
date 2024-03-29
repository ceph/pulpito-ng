import { useParams } from "react-router-dom";
import { useQueryParams, NumberParam } from "use-query-params";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";

import JobList from "../../components/JobList";
import NodeList from "../../components/NodeList";
import type { NodeParams } from "../../lib/paddles.d";

import { useNode, useNodeJobs } from "../../lib/paddles";

export default function Node() {
  const [params, setParams] = useQueryParams({
    page: NumberParam,
    pageSize: NumberParam,
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
          <JobList
            query={jobsQuery}
            params={params}
            setter={setParams}
            manualPagination={true}
            sortMode={"time"}
          />
        </div>
      </div>
    </div>
  );
}
