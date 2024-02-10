import { useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import Link from '@mui/material/Link';
import {
  useMaterialReactTable,
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

import FilterMenu from "../../components/FilterMenu";
import useDefaultTableOptions from "../../lib/table";

import { useMachineTypes, useStatsNodeJobs } from "../../lib/paddles";
import { type StatsJobsResponse } from "../../lib/paddles.d";


export const columns: MRT_ColumnDef<StatsJobsResponse>[] = [
  {
    header: "name",
    accessorKey: "name",
    size: 200,
    Cell: ({ row }) => {
      const name = row.original.name;
      return <Link href={`/nodes/${name}/`} color="inherit">{name.split(".")[0]}</Link>;
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

export default function StatsNodesJobs() {
  const [params, setParams] = useSearchParams({
    machine_type: "",
    since_days: "",
  });
  const machine_type = params.get("machine_type");
  const since_days = params.get("since_days");
  const query = useStatsNodeJobs(params);
  const options = useDefaultTableOptions<StatsJobsResponse>();

  const data = query.data || [];
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
    state: {
      isLoading: query.isLoading || query.isFetching,
    },
  });
  if (query === null) return <Typography>404</Typography>;
  if (query.isError) return null;
  return (
    <div>
      <Helmet>
        <title>Stats Nodes Jobs - Pulpito</title>
      </Helmet>
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
          <FilterMenu
            type="machine_type"
            value={machine_type}
            setter={setParams}
            optionsHook={useMachineTypes}
            width={150}
          />
        </div>
      </div>
      <MaterialReactTable table={table} />
    </div>
  );
}
