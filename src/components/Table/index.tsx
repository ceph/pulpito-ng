import React, { Fragment } from 'react';

import {
  flexRender,
  type Row,
  type Table as TanstackTable,
} from '@tanstack/react-table';

import './index.css';

type TableProps<TData> = {
  table: TanstackTable<TData>,
  rowClass?: Function,
  detailPanel?: (props: {row: Row<TData>}) => React.ReactElement | null,
}

export default function Table<TData> ({table, rowClass, detailPanel}: TableProps<TData>) {
  return (
    <table className='pulpito'>
      <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
                    {detailPanel({row})}
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
