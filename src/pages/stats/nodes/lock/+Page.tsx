import { useState } from 'react';
import { Config } from 'vike-react/Config'
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import Typography from '@mui/material/Typography';
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';

import {
  getColumnFiltersCallback,
  parseParams,
  useDefaultTableOptions,
} from '#src/lib/table';
import FilterMenu from '#src/components/FilterMenu';
import Table from '#src/components/Table';

import {
  type FilterMenuSections,
  type NodeLockStats,
} from '#src/lib/types';
import { MACHINE_TYPES } from '#src/lib/paddles';


export const columns: ColumnDef<NodeLockStats>[] = [
  {
    header: "owner",
    accessorKey: "owner",
  },
  {
    header: "machine type",
    accessorKey: "machine_type",
  },
  {
    header: "count",
    accessorKey: "count",
  },
]

const FILTER_SECTIONS: FilterMenuSections = {
  node: {
    label: 'Filter by node details',
    filters: {
      machine_type: {
        label: 'machine type',
        options: MACHINE_TYPES,
      },
      owner: {
        label: 'owner',
        size: '20',
      },
    },
  },
}

export default function StatsNodesLock() {
  const [openFilterMenu, setOpenFilterMenu] = useState<boolean>(false);
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  const { columnFilters, pagination } = parseParams(params);
  const onColumnFiltersChange = getColumnFiltersCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "owner",
      desc: false,
    },
  ]);
  const machine_type = params.machine_type || "";
  const options = useDefaultTableOptions<NodeLockStats>();
  const data = useData<NodeLockStats[]>();
  const table = useReactTable({
    ...options,
    columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange,
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
    },
    state: {
      columnFilters,
      sorting,
    },
  });
  return (
    <div>
      <Config title="Node lock stats - Pulpito" />
      <Typography variant="h5" style={{ margin: "20px" }}>
        Machine usage for up {machine_type || ""} nodes
      </Typography>
      <div className='tableContainer'>
        <div className='tableControls'>
          <FilterMenu
            isOpen={openFilterMenu}
            onChange={setOpenFilterMenu}
            table={table}
            sections={FILTER_SECTIONS}
          />
        </div>
        <Table table={table} />
      </div>
    </div>
  );
}
