import { ReactNode, useMemo } from "react";
import { useData } from 'vike-react/useData'
import DescriptionIcon from "@mui/icons-material/Description";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  useMaterialReactTable,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from 'material-react-table';
import type { UseQueryResult } from "@tanstack/react-query";
import { type Theme } from "@mui/material/styles";

import { formatDate, formatDuration } from "../../lib/utils";
import IconLink from "../../components/IconLink";
import Link from "../../components/Link";
import type { Job, NodeJobs, Run } from "../../lib/paddles.d";
import { dirName } from "../../lib/utils";
import useDefaultTableOptions from "../../lib/table";

import sentryIcon from "./assets/sentry.svg";


const columns: MRT_ColumnDef<Job>[] = [
  {
    header: "status",
    accessorKey: "status",
    size: 120,
    filterVariant: "select",
  },
  {
    header: "links",
    id: "links",
    size: 75,
    Cell: ({ row }) => {
      const log_url = row.original.log_href;
      const sentry_url = row.original.sentry_event;
      return (
        <div>
          {log_url? (
            <IconLink to={dirName(log_url)}>
              <DescriptionIcon fontSize="small" style={{marginLeft: '5px'}} />
            </IconLink>
          ) : null}
          {sentry_url ? (
            <IconLink to={sentry_url}>
              <img
                src={`${sentryIcon}`}
                alt="Sentry icon"
                style={{height: '20px', width: '20px', marginLeft: '5px'}}
              />
            </IconLink>
          ) : null}
        </div>
      );
    },
  },
  {
    header: "job ID",
    accessorKey: "job_id",
    size: 110,
    Cell: ({ row }) => {
      return (
        <Link
          to={`/runs/${row.original.name}/jobs/${row.original.job_id}`}
          color="inherit"
        >
            {row.original.job_id}
        </Link>
      );
    },
  },
  {
    header: "tasks",
    id: "tasks",
    accessorFn: (row: Job) => {
      const tasks = Object.values(row.tasks || {});
      const task_list = tasks.map(task => {
          if (Object.keys(tasks).length > 0) 
            return Object.keys(task)[0];
          return [];
        });
      const result = task_list.join(', ');
      return result;
    },
    size: 200,
    filterFn: 'contains',
    enableColumnFilter: true,
  },
  {
    header: "description",
    size: 200,
    accessorFn: (row: Job) => row.description + "",
    filterFn: 'contains',
    enableColumnFilter: true,
  },
  {
    header: "posted",
    id: "posted",
    accessorFn: (row: Job) => formatDate(row.posted),
    filterVariant: 'date',
    sortingFn: "datetime",
    size: 150,
  },
  {
    header: "updated",
    id: "updated",
    accessorFn: (row: Job) => formatDate(row.updated),
    filterVariant: 'date',
    sortingFn: "datetime",
    size: 150,
  },
  {
    header: "started",
    id: "started",
    accessorFn: (row: Job) => formatDate(row.started),
    filterVariant: 'date',
    sortingFn: "datetime",
    size: 150,
  },
  {
    header: "runtime",
    id: "runtime",
    size: 110,
    accessorFn: (row: Job) => {
      const start = Date.parse(row.started);
      const end = Date.parse(row.updated);
      if (!end || !start) return "";
      return formatDuration(Math.round((end - start) / 1000));
    },
    enableColumnFilter: false,
  },
  {
    header: "duration",
    id: "duration",
    size: 120,
    accessorFn: (row: Job) =>
      formatDuration(row.duration),
    enableColumnFilter: false,
  },
  {
    header: "in waiting",
    id: "waiting",
    size: 100,
    accessorFn: (row: Job) => {
      const start = Date.parse(row.started);
      const end = Date.parse(row.updated);
      if (!end || !start || !row.duration) return "";
      return formatDuration(Math.round((end - start) / 1000 - row.duration));
    },
    enableColumnFilter: false,
  },
  {
    header: "machine type",
    accessorKey: "machine_type",
    filterVariant: "select",
  },
  {
    header: "OS type",
    size: 85,
    accessorFn: (row: Job) => row.os_type + "",
    filterVariant: "select",
  },
  {
    header: "OS version",
    accessorFn: (row: Job) => row.os_version + "",
    size: 85,
    filterVariant: "select",
  },
  {
    header: "nodes",
    accessorKey: "nodes",
    accessorFn: (row: Job) => {
      return Object.keys(row.targets || row.roles || {}).length || 0;
    },
    size: 85,
  },
];

function jobStatusToThemeCategory(status: string): keyof Theme["palette"] {
  switch (status) {
    case "dead": return "error";
    case "fail": return "error";
    case "finished fail": return "error";
    case "pass": return "success";
    case "finished pass": return "success";
    case "running": return "warning";
    default: return "info";
  }
};

type JobDetailPanelProps = {
  row: MRT_Row<Job>;
}

function JobDetailPanel(props: JobDetailPanelProps): ReactNode {
  const failure_reason = props.row.original.failure_reason;
  if ( ! failure_reason ) return null;
  return (
    <Box
      sx={{
        borderLeft: 1,
        borderColor: (theme) => theme.palette.grey[800],
        padding: 1,
        color: (theme) => theme.palette.text.primary,
      }}
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

type JobListProps = {
  sortMode?: "time" | "id";
}

export default function JobList({ sortMode }: JobListProps) {
  const data_: Run = useData();
  const options = useDefaultTableOptions<Job>();
  const data = useMemo(() => {
    return (data_?.jobs || []).filter(item => {
      item.id = String(item.job_id);
      return !! item.id;
    });
  }, [data_, sortMode]);
  const table = useMaterialReactTable({
    ...options,
    columns,
    data: data,
    enableFacetedValues: true,
    enableGlobalFilter: true,
    enableGlobalFilterRankedResults: false,
    positionGlobalFilter: "left",
    globalFilterFn: 'contains',
    muiSearchTextFieldProps: {
      placeholder: 'Search across all fields',
      sx: { minWidth: '200px' },
    },
    initialState: {
      ...options.initialState,
      columnVisibility: {
        posted: false,
        updated: false,
        duration: false,
        waiting: false,
        tasks: false,
        description: false,
      },
      pagination: {
        pageIndex: 0,
        pageSize: 25,
      },
      sorting: [
        {
          id: sortMode === "time"? "started" : "job_id",
          desc: true,
        },
      ],
      showGlobalFilter: true,
    },
    renderDetailPanel: JobDetailPanel,
    muiTableBodyRowProps: ({row, isDetailPanel}) => {
      if ( isDetailPanel ) {
        return row.original.failure_reason? {} : {className: "empty"};
      }
      const category = jobStatusToThemeCategory(row.original.status);
      if ( category ) return { className: category };
      return {};
    },
  });
  return <MaterialReactTable table={table} />
}
