import { useMemo, useState } from "react";
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import DescriptionIcon from "@mui/icons-material/Description";
import {
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { type Theme } from "@mui/material/styles";

import { formatDate, formatDuration } from "../../lib/utils";
import IconLink from "../../components/IconLink";
import Link from "../../components/Link";
import type { Job, Run } from "../../lib/paddles.d";
import { dirName } from "../../lib/utils";
import {
  getPaginationCallback,
  parseParams,
  useDefaultTableOptions,
} from "../../lib/table";
import Table from '../Table';
import Paginator from '../Paginator';
import JobDetailPanel from "../JobDetailPanel";

import sentryIcon from "./assets/sentry.svg";


const columns: ColumnDef<Job>[] = [
  {
    id: 'expander',
    header: ({ table }) => (
      <div>
        <button
          className='expandButton'
          onClick={table.getToggleAllRowsExpandedHandler()}
        >
          {table.getIsAllRowsExpanded() ? '-' : '+'}
        </button>
      </div>
    ),
    cell: ({ row }) => (
      row.getCanExpand() &&
      <button className='expandButton' onClick={row.getToggleExpandedHandler()} >
        {row.getIsExpanded() ? '-' : '+'}
      </button>
    ),
  },
  {
    header: "status",
    accessorKey: "status",
    size: 120,
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "links",
    id: "links",
    size: 75,
    cell: ({ row }) => {
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
    cell: ({ row }) => {
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
    enableColumnFilter: true,
    meta: {
      filterFn: 'contains',
    },
  },
  {
    header: "description",
    size: 200,
    accessorFn: (row: Job) => row.description + "",
    enableColumnFilter: true,
    meta: {
      filterFn: 'contains',
    },
  },
  {
    header: "posted",
    id: "posted",
    accessorFn: (row: Job) => formatDate(row.posted),
    sortingFn: "datetime",
    size: 150,
    meta: {
      filterVariant: 'date',
    },
  },
  {
    header: "updated",
    id: "updated",
    accessorFn: (row: Job) => formatDate(row.updated),
    sortingFn: "datetime",
    size: 150,
    meta: {
      filterVariant: 'date',
    },
  },
  {
    header: "started",
    id: "started",
    accessorFn: (row: Job) => formatDate(row.started),
    sortingFn: "datetime",
    size: 150,
    meta: {
      filterVariant: 'date',
    },
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
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "OS type",
    size: 85,
    accessorFn: (row: Job) => row.os_type + "",
    meta: {
      filterVariant: "select",
    },
  },
  {
    header: "OS version",
    accessorFn: (row: Job) => row.os_version + "",
    size: 85,
    meta: {
      filterVariant: "select",
    },
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

type JobListProps = {
  sortMode?: "time" | "id";
  pagination?: boolean;
}

export default function JobList(props: JobListProps) {
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  const data_: Run = useData();
  const options = useDefaultTableOptions<Job>();
  const data = useMemo(() => {
    return (data_?.jobs || []).filter(item => {
      item.id = String(item.job_id);
      return !! item.id;
    });
  }, [data_]);
  const { pagination } = parseParams(params);
  const onPaginationChange = getPaginationCallback({
    path: context.urlPathname, columnFiltersState: [], paginationState: pagination
  });
  const [sorting, setSorting] = useState<SortingState>([{
      id: props.sortMode === "time"? "started" : "job_id",
      desc: true,
  }]);
  const table = useReactTable({
    ...options,
    columns,
    data: data || [],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => !! row.original.failure_reason,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    // enableFacetedValues: true,
    enableGlobalFilter: true,
    // enableGlobalFilterRankedResults: false,
    // positionGlobalFilter: "left",
    // globalFilterFn: 'contains',
    manualPagination: true,
    onPaginationChange,
    rowCount: Infinity,
    // muiSearchTextFieldProps: {
    //   placeholder: 'Search across all fields',
    //   sx: { minWidth: '200px' },
    // },
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
    },
    state: {
      pagination,
      sorting,
    },
  });
  const rowClass = (row: Row<Job>) => {
    const category = jobStatusToThemeCategory(row.getValue('status'));
    return category || '';
  }
  return (
    <div className='tableContainer'>
      <div className='tableControls'>
        { props.pagination? <Paginator table={table} /> : null }
      </div>
      <Table table={table} rowClass={rowClass} detailPanel={JobDetailPanel} />
      { table.getState().pagination.pageSize >= 10? (
      <div className='tableControls'>
        { props.pagination? <Paginator table={table} /> : null }
      </div> ) : null }
    </div>
  )
}
