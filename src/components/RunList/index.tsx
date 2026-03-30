import { useState } from 'react';
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useDebounceValue } from "usehooks-ts";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
  type TableOptions,
} from '@tanstack/react-table';
import { type Theme } from "@mui/material/styles";

import {
  formatDate,
  formatDuration,
} from "../../lib/utils";
import IconLink from "../../components/IconLink";
import {
  type Run,
  RunStatuses,
  Flavors,
} from "../../lib/paddles.d";
import { MACHINE_TYPES } from '#src/lib/paddles';
import {
  getColumnFiltersCallback,
  getPaginationCallback,
  parseParams,
  useDefaultTableOptions,
} from "../../lib/table";

import FilterMenu from '../FilterMenu';
import { type FilterMenuSections } from '#src/lib/types.d';
import Table from '../Table';
import Paginator from '../Paginator';


const _columns: ColumnDef<Run>[] = [
  {
    accessorKey: "name",
    header: "link",
    maxSize: 40,
    enableColumnFilter: false,
    cell: ({ row }) => {
      return (
        <IconLink to={`/runs/${row.original.name}`}>
          <OpenInNewIcon fontSize="small" style={{marginLeft: "5px"}} />
        </IconLink>
      );
    },
  },
  {
    header: "status",
    accessorKey: "status",
    cell: ({ row }) => {
      return row.original.status.replace("finished ", "");
    },
  },
  {
    accessorKey: "user",
    header: "user",
    enableColumnFilter: false,
  },
  {
    accessorKey: "priority",
    header: "priority",
    enableColumnFilter: false,
  },
  {
    id: "scheduled",
    header: "scheduled",
    accessorFn: (row: Run) => formatDate(row.scheduled),
    sortingFn: "datetime",
    cell: ({ row }) => {
      const date_: string[] = row.original.scheduled.split(" ");
      return <> {date_[0]} <br /> {date_[1]} </>
    },
  },
  {
    id: "started",
    header: "started",
    accessorFn: (row: Run) => formatDate(row.started),
    enableColumnFilter: false,
    sortingFn: "datetime",
  },
  {
    id: "posted",
    header: "updated",
    accessorFn: (row: Run) => formatDate(row.posted),
    enableColumnFilter: false,
    sortingFn: "datetime",
  },
  {
    id: "runtime",
    header: "runtime",
    accessorFn: (row: Run) => {
      const start = Date.parse(row.started);
      const end = Date.parse(row.updated);
      if (!end || !start) return null;
      return formatDuration(Math.round((end - start) / 1000));
    },
    enableColumnFilter: false,
    sortingFn: "datetime",
  },
  {
    accessorKey: "suite",
    header: "suite",
    size: 150,
  },
  {
    accessorKey: "branch",
    header: "branch",
    size: 300,
    cell: ({ row }) => {
        return <span className="hardWrap">{row.original.branch}</span>
    },
  },
  {
    id: "flavors",
    accessorKey: "flavor",
    header: "flavor",
    cell: ({ row }) => {
      if (!row.original.flavor) return "-";
      return row.original.flavor;
    },
  },
  {
    accessorKey: "machine_type",
    header: "machine type",
  },
  {
    accessorKey: "sha1",
    header: "hash",
    cell: ({ row }) => {
      return row.original.sha1?.slice(0, 8);
    },
  },
  {
    accessorKey: "results.queued",
    header: "queued",
    size: 20,
  },
  {
    accessorKey: "results.pass",
    header: "pass",
    size: 20,
  },
  {
    accessorKey: "results.fail",
    header: "fail",
    size: 20,
  },
  {
    accessorKey: "results.dead",
    header: "dead",
    size: 20,
  },
  {
    accessorKey: "results.running",
    header: "running",
    size: 20,
  },
  {
    accessorKey: "results.waiting",
    header: "waiting",
    size: 20,
 },
  {
    accessorKey: "results.total",
    header: "total",
    size: 20,
  },
];

const FILTER_SECTIONS: FilterMenuSections = {
  run: {
    label: 'Filter by run details',
    filters: {
      scheduled: {label: 'date', component: 'mantine-date'},
      suite: {label: 'suite'},
      machine_type: {
        label: 'machine type',
        options: MACHINE_TYPES,
      },
      user: {label: 'user'},
      status: {
        label: 'status',
        options: RunStatuses,
      },
    },
  },
  build: {
    label: 'Filter by build details',
    filters: {
      branch: {
        label: 'branch',
        options: ['main', 'umbrella', 'tentacle', 'squid', 'reef', 'reef-release'],
      },
      sha1: {label: 'SHA1'},
      flavors: {
        label: 'flavor',
        options: Flavors,
      },
    },
  },
}

function runStatusToThemeCategory(status: string): keyof Theme["palette"] {
  switch (status) {
    case "finished dead": return "error";
    case "finished fail": return "error";
    case "finished pass": return "success";
    case "running": return "warning";
    default: return "info";
  }
};

type RunListProps = {
  params: Record<string,string>;
  pagination?: boolean;
  tableOptions?: Partial<TableOptions<Run>>;
}

export default function RunList(props: RunListProps) {
  const [openFilterMenu, setOpenFilterMenu] = useState<boolean>(false);

  const { params, tableOptions } = props;
  const context = usePageContext();
  const options = useDefaultTableOptions<Run>();
  const debouncedParams = useDebounceValue(params, 500)[0];
  const { columnFilters, pagination } = parseParams(debouncedParams);
  const onColumnFiltersChange = getColumnFiltersCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  const onPaginationChange = getPaginationCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  const [sorting, setSorting] = useState<SortingState>([{
      id: "scheduled",
      desc: true,
  }]);
  const data: Run[] = useData() || [];
  const columns = _columns;
  const table = useReactTable({
    ...options,
    columns,
    data: data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualFiltering: true,
    manualPagination: true,
    onPaginationChange,
    rowCount: props.pagination === false? data.length : Infinity,
    onColumnFiltersChange,
    enableColumnFilters: false,
    initialState: {
      ...options.initialState,
      columnVisibility: {
        started: false,
        posted: false,
        'results.total': false,
      },
    },
    state: {
      columnFilters,
      pagination,
      sorting,
    },
    ...tableOptions,
  });
  function rowClass (row: Row<Run>) {
    return runStatusToThemeCategory(row.getValue('status'))
  }
  return (
    <div className='tableContainer'>
      <div style={{textAlign: 'right'}}>
        { table.getState().columnFilters.map((column) => {
            let filterValue = column.value;
            if (column.id === "scheduled") {
              const parsedDate = new Date(column.value as string);
              filterValue = (parsedDate.toISOString().split('T')[0])
            }
            return (column.value ? `${column.id}: '${filterValue}' ` : "")
          } )}
      </div>
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
      />
      { table.getState().pagination.pageSize >= 10? (
      <div className='tableControls'>
        { props.pagination? <Paginator table={table} /> : null }
      </div> ) : null }
    </div>
  )
}
