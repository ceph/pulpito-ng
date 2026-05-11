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
import IconLink from "../IconLink";
import FilterMenu from '../FilterMenu';
import Link from "../Link";
import type { Job, Run } from "../../lib/paddles.d";
import { JobStatuses } from "../../lib/paddles.d";
import {
  type FilterMenuSections,
  type RowDetail,
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


// const columns: ColumnDef<Job>[] = [
const getColumns = (setDetails: React.Dispatch<React.SetStateAction<RowDetail[]>>): ColumnDef<Job>[] => {
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
    // header: ({ table }) => (
    //   <div>
    //     <button
    //       className='expandButton'
    //       onClick={table.getToggleAllRowsExpandedHandler()}
    //     >
    //       {table.getIsAllRowsExpanded() ? '-' : '+'}
    //     </button>
    //   </div>
    // ),
    cell: ({ row }) => (
      row.getCanExpand() &&
      <button className='expandButton' onClick={row.getToggleExpandedHandler()} >
        {row.getIsExpanded() ? '-' : '+'}
      </button>
    ),
    size: 20,
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
      const start = Date.parse(row.started);
      const end = Date.parse(row.updated);
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
      const start = Date.parse(row.started);
      const end = Date.parse(row.updated);
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
        type: "mantine-select",
      },
    },
  },
}

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
  const { columnFilters, pagination } = parseParams(params);
  const onColumnFiltersChange = getColumnFiltersCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  const data = useMemo(() => {
    return (data_?.jobs || []).filter(item => {
      item.id = String(item.job_id);
      return !! item.id;
    }).filter(item => {
      for ( let i = 0; i < columnFilters.length; i++ ) {
        const filter = columnFilters[i];
        if ( item[filter.id as keyof Job] !== filter.value ) return false;
      }
      return true
    });
  }, [data_]);
  const [openFilterMenu, setOpenFilterMenu] = useState<boolean>(false);
  const onPaginationChange = getPaginationCallback({
    path: context.urlPathname, columnFiltersState: [], paginationState: pagination
  });
  const [sorting, setSorting] = useState<SortingState>([{
      id: props.sortMode === "time"? "started" : "job_id",
      desc: true,
  }]);
  const [details, setDetails] = useState<RowDetail[]>([
    {key: "description", display: true},
    {key: "failure_reason", display: true},
  ]);
  const columns = useMemo(() => getColumns(setDetails), [setDetails]);
  const getRowCanExpand = (row: Row<Job>) => {
    return details.filter(detail => detail.display && row.original[detail.key as keyof Job]).length >= 1;
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
    // enableFacetedValues: true,
    // enableGlobalFilter: true,
    manualFiltering: true,
    // enableGlobalFilterRankedResults: false,
    // positionGlobalFilter: "left",
    // globalFilterFn: 'contains',
    manualPagination: true,
    onPaginationChange,
    rowCount: data.length,
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
      columnFilters,
      pagination,
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
        <FilterMenu
          isOpen={openFilterMenu}
          onChange={setOpenFilterMenu}
          table={table}
          sections={FILTER_SECTIONS}
        />
        { props.pagination? <Paginator table={table} /> : null }
      </div>
      <Table
        table={table}
        rowClass={rowClass}
        detailPanel={JobDetailPanel}
        details={details}
      />
      { table.getState().pagination.pageSize >= 10? (
      <div className='tableControls'>
        { props.pagination? <Paginator table={table} /> : null }
      </div> ) : null }
    </div>
  )
}
