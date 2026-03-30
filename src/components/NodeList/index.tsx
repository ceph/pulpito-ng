import { useState } from 'react';
import { usePageContext } from 'vike-react/usePageContext'
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table';


import type { Node } from "#src/lib/paddles.d";
import { formatDate } from "#src/lib/utils";
import {
  getColumnFiltersCallback,
  getPaginationCallback,
  useDefaultTableOptions,
  parseParams,
} from "../../lib/table";
import Table from '../Table';
import FilterMenu from '../FilterMenu';
import Paginator from '../Paginator';
import { MACHINE_TYPES } from '#src/lib/paddles';
import { type FilterMenuSections } from '#src/lib/types.d';

import './index.css';


export const columns: ColumnDef<Node>[] = [
  {
    header: "name",
    accessorKey: "name",
    size: 20,
    cell: ( { row } ) => {
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
  {
    header: "machine type",
    accessorKey: "machine_type",
  },
  {
    header: "up",
    accessorFn: (row: Node) => row.up?.toLocaleString(),
    size: 20,
  },
  {
    header: "locked",
    accessorFn: (row: Node) => row.locked?.toLocaleString(),
    size: 60,
  },
  {
    header: "locked since",
    sortingFn: "datetime",
    accessorFn: (row: Node) => row.locked_since? formatDate(row.locked_since): "",
    size: 100,
    enableColumnFilter: false,
  },
  {
    header: "locked by",
    accessorKey: "locked_by",
    size: 20,
  },
  {
    header: "OS type",
    id: 'os_type',
    accessorFn: (row) => row.os_type || "none",
    size: 60,
  },
  {
    header: "OS ver.",
    id: 'os_version',
    accessorFn: (row) => row.os_version || "none",
    size: 60,
  },
  {
    header: "arch",
    accessorKey: "arch",
  },
  {
    header: "description",
    accessorKey: "description",
    size: 500,
  },
];

const FILTER_SECTIONS: FilterMenuSections = {
  node: {
    filters: {
      machine_type: {
        label: 'machine type',
        options: MACHINE_TYPES,
      },
      os_type: {
        label: 'OS',
        options: ['ubuntu', 'centos', 'rocky'],
      },
      os_version: {
        label: 'OS ver.',
      },
    },
  },
  status: {
    filters: {
      up: {
        label: 'up',
        component: 'mantine-checkbox',
      },
      locked: {
        label: 'locked',
        component: 'mantine-checkbox',
      },
    },
  },
}

type NodeListProps = {
  nodes: Node[],
  pagination?: boolean;
}

export default function NodeList(props: NodeListProps) {
  const [openFilterMenu, setOpenFilterMenu] = useState<boolean>(false);
  const context = usePageContext();
  const params = context?.urlParsed.search || {};
  const { columnFilters, pagination } = parseParams(params);
  const onColumnFiltersChange = getColumnFiltersCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  const onPaginationChange = getPaginationCallback({
    path: context.urlPathname, columnFiltersState: columnFilters, paginationState: pagination
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "machine_type",
      desc: false,
    },
    {
      id: "name",
      desc: false,
    },
  ]);
  const options = useDefaultTableOptions<Node>();
  options.state = {};
  options.state.columnVisibility = {};
  if ( props.nodes.length <= 1 ) {
    options.enableFilters = false;
    options.state.columnVisibility = {
      name: false,
    };
  }
  if ( new Set(props.nodes.map(node => node.machine_type)).size === 1 ) {
    options.state.columnVisibility.machine_type = false;
  }
  if ( new Set(props.nodes.map(node => node.arch)).size === 1 ) {
    options.state.columnVisibility.arch = false;
  }
  const table = useReactTable({
    ...options,
    columns,
    data: props.nodes,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualFiltering: true,
    manualPagination: true,
    onPaginationChange,
    onColumnFiltersChange,
    enableColumnFilters: false,
    rowCount: props.nodes.length,
    // enableFacetedValues: true,
    initialState: {
      ...options.initialState,
      pagination: {
        pageIndex: 0,
        pageSize: 25,
      },
    },
    state: {
      columnFilters,
      pagination,
      sorting,
    },
  });
  const rowClass = (row: Row<Node>) => {
    return row.original.up === false? 'error' :
      row.original.locked === true? 'warning' :
      row.original.locked === false? 'success' :
      'info'
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
      />
      { props.pagination? <Paginator table={table} /> : null }
    </div>
  )
}
