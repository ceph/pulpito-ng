import { Config } from 'vike-react/Config'
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import Typography from "@mui/material/Typography";
import {
  useMaterialReactTable,
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

import FilterAutocomplete from "#src/components/FilterAutocomplete";
import { MACHINE_TYPES } from '#src/lib/paddles';
import { type StatsJobsResponse } from "#src/lib/paddles.d";
import {
  useDefaultTableOptions,
} from "#src/lib/table";

const columns: MRT_ColumnDef<StatsJobsResponse>[] = [
  {
    header: "name",
    accessorKey: "name",
    size: 200,
    Cell: ({ row }) => {
      const name = row.original.name;
      return <a href={`/nodes/${name}/`} color="inherit">{name.split(".")[0]}</a>;
    },
  },
  {
    header: "pass",
    accessorKey: "pass",
    size: 125,
  },
  {
    header: "fail",
    accessorKey: "fail",
    size: 125,
  },
  {
    header: "dead",
    accessorKey: "dead",
    size: 125,
  },
  {
    header: "unknown",
    accessorKey: "unknown",
    size: 125,
  },
  {
    header: "running",
    accessorKey: "running",
    size: 125,
  },
  {
    header: "total",
    accessorKey: "total",
    size: 125,
  },

]

export default function Page() {
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  const machine_type = params.machine_type || "";
  const since_days = params.since_days || "";
  const options = useDefaultTableOptions<StatsJobsResponse>();
  const data: StatsJobsResponse[] = useData();
  const table = useMaterialReactTable({
    ...options,
    columns,
    data: data,
    rowCount: data.length,
    initialState: {
      ...options.initialState,
      columnVisibility: {
        posted: false,
        updated: false,
      },
      pagination: {
        pageIndex: 0,
        pageSize: 25,
      },
      sorting: [
        {
          id: "name",
          desc: false,
        },
      ],
    },
    // onColumnFiltersChange,
    // onPaginationChange,
  });
  return (
    <div>
      <Config title="Stats Nodes Jobs - Pulpito" />
      <Typography variant="h6" style={{ marginBottom: "20px" }}>
        {since_days || 14}-day stats for {machine_type || "all"} nodes
      </Typography>

      <div style={{ height: "auto", display: "flex" }}>
        <div style={{ display: "flex", flexWrap: "wrap", marginLeft: "auto" }}>
          <div>
            <Typography style={{ padding: "10px" }}>
              Filter&nbsp;by:
            </Typography>
          </div>
          <FilterAutocomplete
            type="machine_type"
            value={machine_type}
            baseUrl="/stats/nodes/jobs/"
            options={MACHINE_TYPES}
          />
        </div>
      </div>
      <MaterialReactTable table={table} />
    </div>
  );

}
