import { ReactElement } from "react";
import { type Row } from '@tanstack/react-table';

import type { Job } from "../../lib/paddles.d";

import "./index.css";

type JobDetailPanelProps = {
  row: Row<Job>;
}

export default function JobDetailPanel(props: JobDetailPanelProps): ReactElement | null {
  const failure_reason = props.row.original.failure_reason;
  // if ( ! failure_reason ) return null;
  return (
    <div
    >
      <p>
        Description:&nbsp;
        <code>{props.row.original.description}</code>
      </p>
      { failure_reason?
        <p className="fr">
          Failure Reason:&nbsp;
          <code>{failure_reason}</code>
        </p>
      : null}
    </div>
  )
};
