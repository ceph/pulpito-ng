import { ReactElement } from "react";
import { type Row } from '@tanstack/react-table';

import type { Job, NarrowJob } from "../../lib/paddles.d";
import type { RowDetail } from "../../lib/types.d";

import "./index.css";

type JobDetailPanelProps = {
  row: Row<Job>;
  details: RowDetail;
}

export function JobDetailPanel(props: JobDetailPanelProps): ReactElement | null {
  return (
    <div
    >
      { Object.entries(props.details).map(([key, display]) => {
        let value = props.row.original[key as keyof NarrowJob];
        return (
        (display && !!value)?
          <p key={key}>{key}:&nbsp;{value}</p>
        : null
      )})}
    </div>
  )
};
