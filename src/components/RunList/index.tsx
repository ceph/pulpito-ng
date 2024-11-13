import { useMemo } from 'react';
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


const DEFAULT_PAGE_SIZE = 25;
const NON_FILTER_PARAMS = [
  "page",
  "pageSize",
];

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
    maxSize: 45,
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
  const [openFilterMenu, setOpenFilterMenu] = useState(false);

  const toggleFilterMenu = (isOpen: boolean) => () => {
    setOpenFilterMenu(isOpen);
  };
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
    ...tableOptions,
  });
  if (query.isError) return null;
  return (
      <div>
        <Button onClick={toggleFilterMenu(!openFilterMenu)} >
          {openFilterMenu ? "Hide": "Show"} Filters
        </Button>
        <FilterMenu isOpen={openFilterMenu} table={table} />
        <MaterialReactTable table={table} />
      </div>
    )
}


// FilterMenu

type FilterMenuProps = {
  isOpen: boolean; 
  table: MRT_TableInstance<Run>;
};


const FILTER_SECTIONS = ["run", "build", "result"]
const FILTER_SECTIONS_COLUMNS = [
  ["scheduled", "suite", "machine_type", "user"],
  ["branch", "sha1"],
  ["status"],
]

function FilterMenu({ isOpen, table}: FilterMenuProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        padding: '0.5em',
        margin: '1em',
        border: '2px dashed grey',
        borderRadius: '8px',
        maxWidth: '100%',
      }}
    >
      {FILTER_SECTIONS_COLUMNS.map((_, sectionIndex) => (
        <Box
          key={`section-${sectionIndex}`}
          sx={{
            marginBottom: '1.5em',
            paddingBottom: '0.5em',
            marginLeft: '0.5em',
          }}
        >
          <Typography variant="body2" gutterBottom color="gray">
            Filter by {FILTER_SECTIONS[sectionIndex]} details...
          </Typography>
          <Grid container spacing={1} alignItems="center">
            {table.getLeafHeaders().map((header) => {
              if (FILTER_SECTIONS_COLUMNS[sectionIndex].includes(header.id)) {
                return (
                  <Grid item xs={2} key={header.id}  marginLeft={"1.5em"}>
                    <MRT_TableHeadCellFilterContainer
                      header={header}
                      table={table}
                      style={{ backgroundColor: 'transparent', width: '100%' }}
                    />
                  </Grid>
                );
              }
              return null;
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  ) 
}
