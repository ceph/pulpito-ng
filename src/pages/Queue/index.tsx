import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";

import RunList from "../../components/RunList";

export default function Queue() {
  const [params, setParams] = useSearchParams({
    queued: "true",
  });
  /*
  , {
    removeDefaultsFromUrl: true,
    updateType: "push",
  });
  */
  const tableOptions = {
    enableFilters: false,
    enablePagination: false,
  }
  return (
    <div>
      <Helmet>
        <title>Queue - Pulpito</title>
      </Helmet>
      <Typography variant="h5" style={{ margin: "20px" }}>
        Queue
      </Typography>
      <RunList params={params} setter={setParams} tableOptions={tableOptions} />
    </div>
  );
}
