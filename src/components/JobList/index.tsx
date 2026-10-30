import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { TextInput } from "@mantine/core";
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { IconFileText } from "@tabler/icons-react";
import {
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table';

import { formatDate, formatDuration, parseTimestamp } from "../../lib/utils";
import IconLink from "../IconLink";
import FilterMenu from '../FilterMenu';
import Link from "../Link";
import type { Job, Run } from "../../lib/paddles.d";
import { JobStatuses } from "../../lib/paddles.d";
import {
  type FilterMenuSections,
  type RowDetail,
  type StatusCategory,
} from '#src/lib/types.d';
import { dirName } from "../../lib/utils";
import {
  getColumnFiltersCallback,
  getPaginationCallback,
  parseParams,
  useDefaultTableOptions,
} from "../../lib/table";
import Table from '../Table';
import Paginator from '../Paginator';
import {
  JobDetailPanel,
} from "../JobDetailPanel";
import DetailMenu from '../DetailMenu'; 

import sentryIcon from "./assets/sentry.svg";


const getColumns = (setDetails: React.Dispatch<React.SetStateAction<RowDetail>>): ColumnDef<Job>[] => {
  return [
  {
    id: 'expander',
    header: ({table}) => (
      <DetailMenu
        table={table}
        details={table.getState().details}
        setDetails={setDetails}
      />
    ),
    cell: ({ row }) => (
      row.getCanExpand() &&
      <button type="button" className='expandButton' onClick={row.getToggleExpandedHandler()} >
        {row.getIsExpanded() ? '-' : '+'}
      </button>
    ),
    size: 40,
  },
  {
    header: "status",
    accessorKey: "status",
    size: 20,
  },
  {
    header: "links",
    id: "links",
    cell: ({ row }) => {
      const log_url = row.original.log_href;
      const sentry_url = row.original.sentry_event;
      return (
        <div>
          {log_url? (
            <IconLink to={dirName(log_url)}>
              <IconFileText size={20} style={{marginLeft: '5px'}} />
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
    size: 20,
  },
  {
    header: "job ID",
    accessorKey: "job_id",
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
    size: 20,
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
    meta: {
      filterFn: 'contains',
    },
  },
  {
    header: "description",
    size: 200,
    accessorFn: (row: Job) => row.description + "",
    meta: {
      filterFn: 'contains',
    },
  },
  {
    header: "posted",
    id: "posted",
    accessorFn: (row: Job) => formatDate(row.posted),
    sortingFn: "datetime",
  },
  {
    header: "updated",
    id: "updated",
    accessorFn: (row: Job) => formatDate(row.updated),
    sortingFn: "datetime",
  },
  {
    header: "started",
    id: "started",
    accessorFn: (row: Job) => formatDate(row.started),
    sortingFn: "datetime",
  },
  {
    header: "runtime",
    id: "runtime",
    accessorFn: (row: Job) => {
      const start = Number(parseTimestamp(row.started));
      const end = Number(parseTimestamp(row.updated));
      if (!end || !start) return "";
      return formatDuration(Math.round((end - start) / 1000));
    },
  },
  {
    header: "duration",
    id: "duration",
    accessorFn: (row: Job) =>
      formatDuration(row.duration),
  },
  {
    header: "in waiting",
    id: "waiting",
    accessorFn: (row: Job) => {
      const start = Number(parseTimestamp(row.started));
      const end = Number(parseTimestamp(row.updated));
      if (!end || !start || !row.duration) return "";
      return formatDuration(Math.round((end - start) / 1000 - row.duration));
    },
  },
  {
    header: "machine type",
    accessorKey: "machine_type",
  },
  {
    header: "OS type",
    accessorFn: (row: Job) => row.os_type + "",
    size: 20,
  },
  {
    header: "OS version",
    accessorFn: (row: Job) => row.os_version + "",
    size: 20,
  },
  {
    header: "nodes",
    accessorKey: "nodes",
    accessorFn: (row: Job) => {
      return Object.keys(row.targets || row.roles || {}).length || 0;
    },
    size: 20,
  },
];
}

const FILTER_SECTIONS: FilterMenuSections = {
  job: {
    label: "Filter by job details",
    filters: {
      status: {
        label: "status",
        options: JobStatuses,
      },
    },
  },
}

function jobSearchText(job: Job): string {
  return [
    job.job_id, job.status, job.description, job.failure_reason,
    job.machine_type, job.os_type, job.os_version, job.started,
    ...Object.keys(job.targets || {}),
  ].filter(Boolean).join(" ").toLowerCase();
}

function jobStatusToThemeCategory(status: string): StatusCategory {
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
  const { columnFilters, pagination } = parseParams(params);
  const onColumnFiltersChange = getColumnFiltersCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  // paddles can't filter a run's jobs by status, so do it here
  const statusFilter = params.status;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const data = useMemo(() => {
    return (data_?.jobs || [])
      .filter(item => !statusFilter || item.status === statusFilter)
      .filter(item => !deferredSearch || jobSearchText(item).includes(deferredSearch))
      .map(item => ({
        ...item,
        id: String(item.job_id)
      }));
  }, [data_, statusFilter, deferredSearch]);
  const [openFilterMenu, setOpenFilterMenu] = useState<boolean>(false);
  // Node pages paginate via paddles (and the URL). Run and history pages get
  // every job at once; paginate those locally so huge runs stay responsive.
  const serverPaginated = !!props.pagination;
  const onPaginationChange = getPaginationCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pagination.pageSize,
  });
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when the job set changes
  useEffect(() => {
    setLocalPagination(p => p.pageIndex === 0 ? p : {...p, pageIndex: 0});
  }, [data]);
  const [sorting, setSorting] = useState<SortingState>([{
      id: props.sortMode === "time"? "started" : "job_id",
      desc: true,
  }]);
  const [details, setDetails] = useState<RowDetail>({
    description: false,
    failure_reason: true,
  });
  const columns = useMemo(() => getColumns(setDetails), []);
  const getRowCanExpand = (row: Row<Job>) => {
    return Object.entries(details).filter(([key, display]) => display && !!row.original[key as keyof Job]).length >= 1;
  }
  const table = useReactTable({
    ...options,
    columns,
    data: data || [],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange,
    onSortingChange: setSorting,
    manualFiltering: true,
    manualPagination: serverPaginated,
    getPaginationRowModel: serverPaginated ? undefined : getPaginationRowModel(),
    // reset to the first page on search/filter changes (below), not on sorting
    autoResetPageIndex: false,
    onPaginationChange: serverPaginated ? onPaginationChange : setLocalPagination,
    // When paginating server-side, paddles doesn't tell us the total, so the
    // page count is unknown (-1) unless this page came back short.
    pageCount: !serverPaginated ? undefined :
      (data_?.jobs || []).length < pagination.pageSize ? pagination.pageIndex + 1 : -1,
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
      columnFilters,
      pagination: serverPaginated ? pagination : localPagination,
      sorting,
      details,
    },
  });
  const rowClass = (row: Row<Job>) => {
    const category = jobStatusToThemeCategory(row.getValue('status'));
    return category || '';
  }
  return (
    <div className='tableContainer'>
      <div className='tableControls'>
        <TextInput
          placeholder={serverPaginated ? "Search this page" : "Search across all fields"}
          aria-label="Search jobs"
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          size="xs"
          style={{ minWidth: "200px" }}
        />
        <FilterMenu
          isOpen={openFilterMenu}
          onChange={setOpenFilterMenu}
          table={table}
          sections={FILTER_SECTIONS}
        />
        <Paginator table={table} />
      </div>
      <Table
        table={table}
        rowClass={rowClass}
        detailPanel={JobDetailPanel}
        details={details}
      />
      { table.getState().pagination.pageSize >= 10? (
      <div className='tableControls'>
        <Paginator table={table} />
      </div> ) : null }
    </div>
  )
}
