import { ReactElement } from "react";
import { type Row } from '@tanstack/react-table';

import type { Job, NarrowJob } from "../../lib/paddles.d";
import type { RowDetail } from "../../lib/types.d";

import "./index.css";

type JobDetailPanelProps = {
  row: Row<Job>;
  // details: string[];
  details: RowDetail;
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

export function JobDetailPanel(props: JobDetailPanelProps): ReactElement | null {
  // const failure_reason = props.row.original.failure_reason;
  // if ( ! failure_reason ) return null;
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
      // { props.details.map(({key, display}) => (
      //   display?
      //     <p>{key}:&nbsp;{props.row.original[key as keyof NarrowJob]}</p>
      //   : null
      //   ))
      // { props.details.map(detail => (
      //   <p>{detail}:&nbsp;{props.row.original[detail as keyof NarrowJob]}</p>
      // ))}
