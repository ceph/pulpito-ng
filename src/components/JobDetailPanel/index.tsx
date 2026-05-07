import { ReactElement } from "react";
import { type Row } from '@tanstack/react-table';

import type { Job } from "../../lib/paddles.d";
import type { RowDetail } from "../../lib/types.d";

import "./index.css";

type JobDetailPanelProps = {
  row: Row<Job>;
  details: RowDetail<Job>[];
  // labels: string[];
  // values: (string | number)[];
  // children: React.ReactElement[];
}

// export type RowDetail<TData> = {
//   // key: keyof TData;
//   key: string;
//   // value: (string | number);
//   display: boolean;
// }

type NarrowJob = Omit<Job, "tasks" | "targets">

export function JobDetailPanel(props: JobDetailPanelProps): ReactElement | null {
  // const failure_reason = props.row.original.failure_reason;
  // if ( ! failure_reason ) return null;
  return (
    <div
    >
      { props.details.map(({key, display}) => (
        display?
          <p>{key}:&nbsp;{props.row.original[key as keyof NarrowJob]}</p>
        : null
        ))
      }
    </div>
  )
};
