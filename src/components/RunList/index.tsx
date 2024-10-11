import { useMemo } from 'react';
import { navigate } from 'vike/client/router'
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useDebounceValue } from "usehooks-ts";
import {
  useMaterialReactTable,
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Updater,
  type MRT_ColumnFiltersState,
  type MRT_TableOptions,
} from 'material-react-table';
import { type Theme } from "@mui/material/styles";
import { parse } from "date-fns";

import {
  formatDate,
  formatDuration,
  getUrl,
} from "../../lib/utils";
import IconLink from "../../components/IconLink";
import type {
  Run,
  RunResult,
  RunResults,
} from "../../lib/paddles.d";
import {
  RunResultKeys,
  RunStatuses,
} from "../../lib/paddles.d";
import {
  DEFAULT_PAGE_SIZE
} from "#src/lib/paddles";
import useDefaultTableOptions from "../../lib/table";


const _columns: MRT_ColumnDef<Run>[] = [
  {
    accessorKey: "name",
    header: "link",
    maxSize: 12,
    enableColumnFilter: false,
    enableColumnActions: false,
    Cell: ({ row }) => {
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
    filterVariant: "select",
    Cell: ({ row }) => {
      return row.original.status.replace("finished ", "");
    },
    filterSelectOptions: Object.values(RunStatuses),
    size: 40,
    enableColumnActions: false,
  },
  {
    accessorKey: "user",
    header: "user",
    maxSize: 45,
    enableColumnFilter: false,
    enableColumnActions: false,
  },
  {
    id: "scheduled",
    header: "scheduled",
    accessorFn: (row: Run) => formatDate(row.scheduled),
    filterVariant: 'date',
    sortingFn: "datetime",
    Cell: ({ row }) => {
      const date_: string[] = row.original.scheduled.split(" ");
      return <div> {date_[0]} <br /> {date_[1]} </div>
    },
    size: 50,
  },
  {
    id: "started",
    header: "started",
    accessorFn: (row: Run) => formatDate(row.started),
    enableColumnFilter: false,
    sortingFn: "datetime",
    size: 125,
  },
  {
    id: "posted",
    header: "updated",
    accessorFn: (row: Run) => formatDate(row.posted),
    enableColumnFilter: false,
    sortingFn: "datetime",
    size: 125,
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
    size: 30,
  },
  {
    accessorKey: "suite",
    header: "suite",
    size: 70,
  },
  {
    accessorKey: "branch",
    header: "branch",
    maxSize: 75,
  },
  {
    accessorKey: "machine_type",
    header: "machine_type",
    size: 30,
  },
  {
    accessorKey: "sha1",
    header: "hash",
    maxSize: 30,
    Cell: ({ row }) => {
      return row.original.sha1?.slice(0, 8);
    },
  },
  {
    accessorKey: "results.queued",
    header: "queued",
    size: 30,
    enableColumnFilter: false,
  },
  {
    accessorKey: "results.pass",
    header: "pass",
    size: 30,
    enableColumnFilter: false,
  },
  {
    accessorKey: "results.fail",
    header: "fail",
    size: 30,
    enableColumnFilter: false,
  },
  {
    accessorKey: "results.dead",
    header: "dead",
    size: 30,
    enableColumnFilter: false,
  },
  {
    accessorKey: "results.running",
    header: "running",
    size: 30,
    enableColumnFilter: false,
  },
  {
    accessorKey: "results.waiting",
    header: "waiting",
    size: 30,
    enableColumnFilter: false,
  },
  {
    accessorKey: "results.total",
    header: "total",
    size: 30,
  },
];

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
  tableOptions?: Partial<MRT_TableOptions<Run>>;
}

export default function RunList(props: RunListProps) {
  const context = usePageContext();
  const { params, tableOptions } = props;
  const options = useDefaultTableOptions<Run>();
  const [debouncedParams, _] = useDebounceValue(params, 500);
  const columnFilters: MRT_ColumnFiltersState = [];
  Object.entries(debouncedParams).forEach(param => {
    const [id, value] = param;
    if ( ["page", "pageSize"].includes(id) ) return;
    if ( id === "date" && !!value ) {
      columnFilters.push({
        id: "scheduled",
        value: parse(value, "yyyy-MM-dd", new Date())
      })
    } else {
      columnFilters.push({id, value})
    }
  });
  let pagination = {
    pageIndex: Number(params.page || 0),
    pageSize: Number(params.pageSize || DEFAULT_PAGE_SIZE),
  };
  const onColumnFiltersChange = (updater: MRT_Updater<MRT_ColumnFiltersState>) => {
    if ( ! ( updater instanceof Function ) ) return;
    const newUrl = getUrl(context.urlPathname, updater(columnFilters), pagination);
    navigate(newUrl.pathname + newUrl.search);
  };
  const onPaginationChange = (updater: MRT_Updater<MRT_PaginationState>) => {
    if ( ! ( updater instanceof Function ) ) return;
    const newUrl = getUrl(context.urlPathname, columnFilters, updater(pagination));
    navigate(newUrl.pathname + newUrl.search);
  };
  const data: Run[] = useData();
  const jobTotals = useMemo(() => {
    const result: Partial<RunResults> = {};
    RunResultKeys.forEach(
      status => {
        let sub = result[status] || 0;
        data.forEach(run => {
          sub += run.results[status]
        });
        result[status] = sub;
    });
    return result;
  }, [data])
  const columns = useMemo(() => _columns.map(col =>
    col.header in jobTotals? {...col, Footer: jobTotals[col.header as RunResult]} : col
  ), [data]);
  const table = useMaterialReactTable({
    ...options,
    columns,
    data: data || [],
    manualPagination: true,
    manualFiltering: true,
    onPaginationChange,
    rowCount: Infinity,
    muiPaginationProps: {
      showLastButton: false,
    },
    onColumnFiltersChange,
    initialState: {
      ...options.initialState,
      columnVisibility: {
        started: false,
        posted: false,
        'results.total': false,
      },
      sorting: [
        {
          id: "scheduled",
          desc: true,
        },
      ],
    },
    state: {
      columnFilters,
      pagination,
    },
    muiTableBodyRowProps: ({row}) => {
      const category = runStatusToThemeCategory(row.original.status);
      if ( category ) return { className: category };
      return {};
    },
    ...tableOptions,
  });
  return <MaterialReactTable table={table} />
}
