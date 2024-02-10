import { useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { Helmet } from "react-helmet";
import {
  useMaterialReactTable,
  MaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

import useDefaultTableOptions from "../../lib/table";

import { useStatsNodeLocks } from "../../lib/paddles";
import { type StatsLocksResponse } from "../../lib/paddles.d";


export const columns: MRT_ColumnDef<StatsLocksResponse>[] = [
  {
    header: "owner",
    accessorKey: "owner",
    size: 200,
  },
  {
    header: "machine type",
    accessorKey: "machine_type",
    size: 200,
  },
  {
    header: "count",
    accessorKey: "count",
    size: 125,
  },

]

export default function StatsNodesLock() {
  const [params, _] = useSearchParams({
    machine_type: "",
  });
  const machine_type = params.get("machine_type");
  const query = useStatsNodeLocks(params);
  const options = useDefaultTableOptions<StatsLocksResponse>();
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
          id: "owner",
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
        <title>Stats Nodes Lock - Pulpito</title>
      </Helmet>
      <Typography variant="h6" style={{ marginBottom: "20px" }}>
        Machine usage for up {machine_type || ""} nodes
      </Typography>
      <MaterialReactTable table={table} />
    </div>
  );
}
