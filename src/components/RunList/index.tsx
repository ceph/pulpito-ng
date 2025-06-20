import { SetStateAction, useMemo } from 'react';
import { useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import type {
  DecodedValueMap,
  QueryParamConfigMap,
  SetQuery,
} from "use-query-params";
import { useDebounce } from "usehooks-ts";
import {
  useMaterialReactTable,
  MaterialReactTable,
  MRT_TableHeadCellFilterContainer,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Updater,
  type MRT_ColumnFiltersState,
  type MRT_TableOptions,
  type MRT_TableInstance,
} from 'material-react-table';
import { type Theme } from "@mui/material/styles";
import { parse } from "date-fns";

import { useRuns } from "../../lib/paddles";
import { formatDate, formatDay, formatDuration } from "../../lib/utils";
import IconLink from "../../components/IconLink";
import TableFilterMenu from "../../components/TableFilterMenu";
import type {
  Run,
  RunResult,
  RunResults,
} from "../../lib/paddles.d";
import {
  RunResultKeys,
  RunStatuses,
} from "../../lib/paddles.d";
import useDefaultTableOptions from "../../lib/table";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';


const DEFAULT_PAGE_SIZE = 25;
const NON_FILTER_PARAMS = [
  "page",
  "pageSize",
];
const FILTER_SECTIONS: { [key: string]: string[] } = {
  "run": ["scheduled", "suite", "machine_type", "user"],
  "build": ["branch", "sha1"],
  "result": ["status"],
}

const _columns: MRT_ColumnDef<Run>[] = [
  {
    accessorKey: "name",
    header: "link",
    maxSize: 12,
    enableColumnFilter: false,
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
    maxSize: 25,
  },
  {
    accessorKey: "user",
    header: "user",
    maxSize: 30,
    enableColumnActions: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: "priority",
    header: "priority",
    maxSize: 20,
    enableColumnActions: false,
    enableColumnFilter: false,
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
    size: 35,
  },
  {
    id: "started",
    header: "started",
    accessorFn: (row: Run) => formatDate(row.started),
    enableColumnFilter: false,
    sortingFn: "datetime",
    size: 35,
  },
  {
    id: "posted",
    header: "updated",
    accessorFn: (row: Run) => formatDate(row.posted),
    enableColumnFilter: false,
    sortingFn: "datetime",
    maxSize: 35,
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
    size: 50,
  },
  {
    accessorKey: "branch",
    header: "branch",
    maxSize: 70,
  },
  {
    accessorKey: "machine_type",
    header: "machine type",
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
    enableColumnFilter: false,
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

type RunListParams = {
  [key: string]: number|string;
}

type RunListProps = {
  params: DecodedValueMap<QueryParamConfigMap>;
  setter: SetQuery<QueryParamConfigMap>;
  tableOptions?: Partial<MRT_TableOptions<Run>>;
}

export default function RunList(props: RunListProps) {
  const [openFilterMenu, setOpenFilterMenu] = useState<boolean>(false);
  const [dropMenuAnchorEl, setDropMenuAnchor] = useState<null | HTMLElement>(null);

  const { params, setter, tableOptions } = props;
  const options = useDefaultTableOptions<Run>();
  const debouncedParams = useDebounce(params, 500);
  const columnFilters: MRT_ColumnFiltersState = [];
  Object.entries(debouncedParams).forEach(param => {
    const [id, value] = param;
    if ( NON_FILTER_PARAMS.includes(id) ) return;
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
    pageIndex: params.page || 0,
    pageSize: params.pageSize || DEFAULT_PAGE_SIZE,
  };
  const toggleFilterMenu = (event: { currentTarget: SetStateAction<HTMLElement | null>; }) => {
    if (dropMenuAnchorEl) {
      setDropMenuAnchor(null);
      setOpenFilterMenu(false);
    } else {
      setDropMenuAnchor(event.currentTarget);
      setOpenFilterMenu(true);
    }
  }
  const onColumnFiltersChange = (updater: MRT_Updater<MRT_ColumnFiltersState>) => {
    if ( ! ( updater instanceof Function ) ) return;
    const result: RunListParams = {pageSize: pagination.pageSize};
    const updated = updater(columnFilters);
    updated.forEach(item => {
      if ( ! item.id ) return;
      if ( item.value instanceof Date ) {
        result.date = formatDay(item.value);
      } else if ( typeof item.value === "string" || typeof item.value === "number" ) {
        result[item.id] = item.value
      }
    });
    setter(result);
  };
  const onPaginationChange = (updater: MRT_Updater<MRT_PaginationState>) => {
    if ( ! ( updater instanceof Function ) ) return;
    pagination = updater(pagination);
    const result: Partial<RunListParams> = {
      ...params,
      page: pagination.pageIndex,
    };
    if ( pagination.pageSize != DEFAULT_PAGE_SIZE ) result.pageSize = pagination.pageSize;
    setter(result);
  };
  const query = useRuns(debouncedParams);
  let data = query.data || [];
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
    data: data,
    manualPagination: true,
    manualFiltering: true,
    enableColumnActions: false,
    onPaginationChange,
    rowCount: Infinity,
    muiPaginationProps: {
      showLastButton: false,
    },
    onColumnFiltersChange,
    columnFilterDisplayMode: 'custom',
    enableColumnFilters: false,
    muiFilterTextFieldProps: ({ column }) => ({
      label: column.columnDef.header,
      placeholder: '',
    }),
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
      isLoading: query.isLoading || query.isFetching,
    },
    muiTableBodyRowProps: ({row}) => {
      const category = runStatusToThemeCategory(row.original.status);
      if ( category ) return { className: category };
      return {};
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ padding: '4px' }}>
        <Badge
          color="primary" 
          overlap="circular"
          badgeContent={table.getState().columnFilters.reduce((count, filter) => (filter.value ? count + 1 : count), 0)}
        >
          <Button 
            id="filter-button"
            onClick={toggleFilterMenu}
          >
              Filters
          </Button>
        </Badge>
      </Box>
    ),
    ...tableOptions,
  });
  
  if (query.isError) return null;
  return (
  <div>
    <div>
      <Typography variant="body2" gutterBottom color="gray" textAlign={"right"}>
        { table.getState().columnFilters.map((column) => {
            let filterValue = column.value; 
            if (column.id == "scheduled") {
              const parsedDate = new Date(column.value as string);
              filterValue = (parsedDate.toISOString().split('T')[0])
            }
            return (column.value ? `${column.id}: '${filterValue}' ` : "")
          } )} 
      </Typography>
      <Menu
        id="filter-menu"
        anchorEl={dropMenuAnchorEl}
        open={openFilterMenu}
        onClose={toggleFilterMenu}
        MenuListProps={{
          'aria-labelledby': 'filter-button',
        }}
      >
        <TableFilterMenu isOpen={openFilterMenu} table={table} filterSections={FILTER_SECTIONS}  />
      </Menu>
    </div>
    <MaterialReactTable table={table} />
  </div>
    )
}

