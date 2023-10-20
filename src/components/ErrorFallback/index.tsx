import Typography from "@mui/material/Typography";
import Link from "../Link";

import CodeBlock from "../CodeBlock";

export default function ErrorFallback(props: {error: Error}) {
  return (
    <div>
      <Typography
        color="textPrimary"
        variant="h5"
      >
        Apologies - the component encountered an error. Please&nbsp;
        <Link
          to="https://github.com/ceph/pulpito-ng/issues/new"
        >
          file an issue
        </Link> 
        &nbsp;including this error message:
      </Typography>
      <CodeBlock value={props.error?.message || ""} language="js" />
    </div>
  );
}
