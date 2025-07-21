import { useQueryParams, StringParam, NumberParam, withDefault } from "use-query-params";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";

import RunList from "../../components/RunList";

export default function Runs() {
  const [params, setParams] = useQueryParams({
    branch: StringParam,
    date: StringParam,
    machine_type: StringParam,
    page: withDefault(NumberParam, 0),
    pageSize: NumberParam,
    sha1: StringParam,
    status: StringParam,
    suite: StringParam,
    user: StringParam,
    flavors: StringParam,
  }, {
    removeDefaultsFromUrl: true,
    updateType: "push",
  });
  return (
    <div>
      <Helmet>
        <title>Runs - Pulpito</title>
      </Helmet>
      <Typography variant="h5" style={{ margin: "20px" }}>
        Runs
      </Typography>
      <RunList params={params} setter={setParams} />
    </div>
  );
}
