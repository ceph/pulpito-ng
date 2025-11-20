import { navigate } from 'vike/client/router'

import {
  MRT_RowData,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_TableOptions,
  type MRT_Updater,
} from 'material-react-table';

import { parse } from "date-fns";

import {
  getUrl,
} from "#src/lib/utils";


const DEFAULT_PAGE_SIZE = 25;

interface CallbackFactoryArgs {
  path: string;
  paginationState: MRT_PaginationState;
  columnFiltersState: MRT_ColumnFiltersState;
}

export function getColumnFiltersCallback({path, paginationState, columnFiltersState} : CallbackFactoryArgs) {
  const onColumnFiltersChange = (updater: MRT_Updater<MRT_ColumnFiltersState>) => {
    if ( ! ( updater instanceof Function ) ) return;
    const newUrl = getUrl(path, updater(columnFiltersState), paginationState);
    navigate(newUrl.pathname + newUrl.search);
  };
  return onColumnFiltersChange;
}

export function getPaginationCallback({path, paginationState, columnFiltersState} : CallbackFactoryArgs) {
  const onPaginationChange = (updater: MRT_Updater<MRT_PaginationState>) => {
    if ( ! ( updater instanceof Function ) ) return;
    const newUrl = getUrl(path, columnFiltersState, updater(paginationState));
    navigate(newUrl.pathname + newUrl.search);
  };
  return onPaginationChange;
}

export function parseParams(params: Record<string, string>) {
  const columnFilters: MRT_ColumnFiltersState = [];
  const pagination: MRT_PaginationState = {
    pageIndex: Number(params.page) || 0,
    pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
  };
  Object.entries(params).forEach(param => {
    const [id, value] = param;
    if ( ["page", "pageSize"].includes(id) ) return;
    else if ( id === "date" && !!value ) {
      columnFilters.push({
        id: "scheduled",
        value: parse(value, "yyyy-MM-dd", new Date())
      })
    } else {
      columnFilters.push({id, value})
    }
  });
  return {columnFilters, pagination}
}

export function useDefaultTableOptions<TData extends MRT_RowData>(): Partial<MRT_TableOptions<TData>> {
  return {
    layoutMode: "grid",
    defaultColumn: {
      minSize: 20,
      maxSize: 200,
      size: 75,
    },
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    initialState: {
        density: "compact",
        showColumnFilters: true,
    },
    muiTableHeadCellProps: {
      sx: {
        '& .MuiTableSortLabel-root': {
          display: "none",
        },
      },
    },
    muiTableBodyProps: {
      sx: {
        'tr td:has(svg)': {
          padding: 0,
        },
        'tr td .MuiButtonBase-root': {color: "inherit"},
        'tr.empty': {display: 'none'},
        'td.Mui-TableBodyCell-DetailPanel': {width: "100%", paddingLeft: 5},
        // The following two items hide button and corresponding empty "row"
        // for items whose detail panel is empty. If the library adds a way to
        // avoid populating detail panels on a per-row basis.
        // :has is *almost* supported everywhere: https://caniuse.com/css-has
        'tr:has(td):has(.Mui-TableBodyCell-DetailPanel:empty)': {height: "0px"},
        'tr:has(+ tr.empty) button': {display: "none"},
        '@media (prefers-color-scheme: dark)': {
          'tr:hover td': {filter: "brightness(85%)"},
        },
        '@media (prefers-color-scheme: light)': {
          'tr:hover td': {filter: "brightness(115%)"},
        },
      },
    },
  }
}
