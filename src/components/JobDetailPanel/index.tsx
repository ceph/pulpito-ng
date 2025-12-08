import { ReactElement } from "react";
import { type Row } from '@tanstack/react-table';
import { Box } from "@mantine/core";
import { Typography } from "@mantine/core";

import type { Job } from "../../lib/paddles.d";

type JobDetailPanelProps = {
  row: Row<Job>;
}

export default function JobDetailPanel(props: JobDetailPanelProps): ReactElement | null {
  const failure_reason = props.row.original.failure_reason;
  if ( ! failure_reason ) return null;
  return (
    <Box
    >
      <Typography
        variant="subtitle2"
      >
        Failure Reason:
      </Typography>
      <Typography
        variant="caption"
      >
        <code>{failure_reason}</code>
      </Typography>
    </Box>
  )
};
