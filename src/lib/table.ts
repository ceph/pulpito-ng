import { navigate } from 'vike/client/router'

import {
  RowData,
  type ColumnFiltersState,
  type PaginationState,
  type TableOptions,
  type Updater,
} from '@tanstack/react-table';

import { parse } from "date-fns";

import {
  getUrl,
} from "./utils";


const DEFAULT_PAGE_SIZE = 25;

interface CallbackFactoryArgs {
  path: string;
  paginationState: PaginationState;
  columnFiltersState: ColumnFiltersState;
}

export function getColumnFiltersCallback({path, paginationState, columnFiltersState} : CallbackFactoryArgs) {
  const onColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    if ( ! ( updater instanceof Function ) ) return;
    const newUrl = getUrl(path, updater(columnFiltersState), paginationState);
    navigate(newUrl.pathname + newUrl.search);
  };
  return onColumnFiltersChange;
}

export function getPaginationCallback({path, paginationState, columnFiltersState} : CallbackFactoryArgs) {
  const onPaginationChange = (updater: Updater<PaginationState>) => {
    if ( ! ( updater instanceof Function ) ) return;
    const newUrl = getUrl(path, columnFiltersState, updater(paginationState));
    navigate(newUrl.pathname + newUrl.search);
  };
  return onPaginationChange;
}

export function parseParams(params: Record<string, string>) {
  const columnFilters: ColumnFiltersState = [];
  const pagination: PaginationState = {
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

export function useDefaultTableOptions<TData extends RowData>(): Partial<TableOptions<TData>> {
  return {
    defaultColumn: {
      minSize: 20,
      maxSize: 200,
      size: 75,
    },
    enableGlobalFilter: false,
  }
}
