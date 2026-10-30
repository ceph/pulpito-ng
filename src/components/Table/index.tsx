import React, { Fragment } from 'react';

import {
  flexRender,
  type Row,
  type Table as TanstackTable,
} from '@tanstack/react-table';

import {
  type RowDetail
} from "#src/lib/types.d";

import './index.css';

type TableProps<TData> = {
  table: TanstackTable<TData>,
  rowClass?: Function,
  detailPanel?: (props: DetailPanelProps<TData>) => React.ReactElement | null,
  details?: RowDetail;
}

type DetailPanelProps<TData> = {
  row: Row<TData>;
  details: RowDetail;
}

declare module '@tanstack/react-table' {
  interface TableState {
    showDetails: string[],
    details: RowDetail,
  }
}

const sortIndicators = {
  'asc': ' ▲',
  'desc': ' ▼',
  'false': null,
};

export default function Table<TData> ({table, rowClass, detailPanel, details}: TableProps<TData>) {
  return (
    <table className='pulpito'>
      <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} style={{ width: `${header.getSize()}px` }}>
                  {/* biome-ignore lint/a11y/useSemanticElements: a <button> would need restyling */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={header.column.getToggleSortingHandler()}
                    onKeyDown={e => { if (e.key === "Enter") header.column.getToggleSortingHandler()?.(e) }}
                  >
                    {
                      header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                        )
                    }
                    {
                      sortIndicators[header.column.getIsSorted() || 'false']
                    }
                  </div>
                </th>
              ))}
            </tr>
          ))}
      </thead>
      <tbody>
        {
          table.getRowModel().rows.map(row => {
            return (
            <Fragment key={row.id}>
              <tr key={row.id} className={rowClass === undefined? '' : rowClass(row)} >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              { row.getCanExpand() && row.getIsExpanded() && detailPanel !== undefined && (
                <tr>
                  <td colSpan={row.getVisibleCells().length}>
                    {detailPanel({row, details: details ?? {}})}
                  </td>
                </tr>
              ) }
            </Fragment>
            )
          })
        }
      </tbody>
      <tfoot>
        {table.getFooterGroups().map(footerGroup => (
          <tr key={footerGroup.id}>
            {footerGroup.headers.map(header => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  )
}
