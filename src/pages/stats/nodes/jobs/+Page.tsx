import { useState } from 'react';
import { Config } from 'vike-react/Config'
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { Title } from "@mantine/core";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';

import { MACHINE_TYPES } from '#src/lib/paddles';
import { type NodeJobStats } from '#src/lib/types';
import {
  getColumnFiltersCallback,
  parseParams,
  useDefaultTableOptions,
} from "#src/lib/table";
import Table from '#src/components/Table';
import FilterMenu from '#src/components/FilterMenu';
import { type FilterMenuSections } from '#src/lib/types.d';

const columns: ColumnDef<NodeJobStats>[] = [
  {
    header: "name",
    accessorKey: "name",
    size: 200,
    cell: ({ row }) => {
      const name = row.original.name;
      return <a
        href={`/nodes/${name}/`}
        style={{color: "inherit"}}
        target="_blank"
        rel="noreferrer"
      >
        {name?.split(".")[0]}
      </a>;
    },
  },
  // Hidden; these exist so FilterMenu shows their filters
  {
    header: "machine type",
    accessorKey: "machine_type",
  },
  {
    id: "since_days",
    accessorFn: () => null,
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

const FILTER_SECTIONS: FilterMenuSections = {
  node: {
    label: 'Filter by node details',
    filters: {
      machine_type: {
        label: 'machine type',
        options: MACHINE_TYPES,
      },
      // paddles' job_stats only supports these two filters
      since_days: {
        label: 'days',
        options: ['1', '7', '14', '30', '90'],
      },
    },
  },
}
export default function Page() {
  const [openFilterMenu, setOpenFilterMenu] = useState<boolean>(false);
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  const { columnFilters, pagination } = parseParams(params);
  const onColumnFiltersChange = getColumnFiltersCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ]);
  const machine_type = params.machine_type || "";
  const since_days = params.since_days || "";
  const options = useDefaultTableOptions<NodeJobStats>();
  const data: NodeJobStats[] = useData();
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
        machine_type: false,
        since_days: false,
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
      columnFilters,
      sorting,
    },
  });
  return (
    <div>
      <Config title="Node job stats - Pulpito" />
      <Title order={2} style={{ margin: "20px" }}>
        {since_days || 14}-day job stats for {machine_type || "all"} nodes
      </Title>
      <div className='tableContainer'>
        <div className='tableControls'>
          <FilterMenu
            isOpen={openFilterMenu}
            onChange={setOpenFilterMenu}
            table={table}
            sections={FILTER_SECTIONS}
          />
        </div>
        <Table
          table={table}
        />
      </div>
    </div>
  );

}
