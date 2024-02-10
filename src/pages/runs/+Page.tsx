import { usePageContext } from 'vike-react/usePageContext'
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";

import RunList from "#src/components/RunList";

export default function Page() {
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  return (
    <div>
      <Helmet>
        <title>Runs - Pulpito</title>
      </Helmet>
      <Typography variant="h5" style={{ margin: "20px" }}>
        Runs
      </Typography>
      <RunList params={params}/>
    </div>
  );
}
