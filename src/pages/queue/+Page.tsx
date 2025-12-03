import { Config } from 'vike-react/Config'
import { usePageContext } from 'vike-react/usePageContext'
import Typography from "@mui/material/Typography";

import RunList from "#src/components/RunList";


export default function Page() {
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  delete params.queued;
  return (
    <div>
      <Config title="Queue - Pulpito" />
      <Typography variant="h5" style={{ margin: "20px" }}>
        Queue
      </Typography>
      <RunList params={params} pagination={false}/>
    </div>
  );
}

