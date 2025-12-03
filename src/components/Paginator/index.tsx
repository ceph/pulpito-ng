import {
  type Table as TanstackTable,
} from '@tanstack/react-table';

import './index.css';

export default function Paginator<TData> ({table}: {table: TanstackTable<TData>}) {
  return (
    <>
      <div className="paginatorContainer">
        <div className="paginator">
          <span>
            Page&nbsp;
            <input
              className="pageInput"
              type="number"
              min="1"
              max={table.getPageCount()}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                table.setPageIndex(page)
              }}
            />
            <strong>
              of{' '}{table.getPageCount().toLocaleString()}
            </strong>
          </span>
          <span>
            &nbsp;|&nbsp;
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
            table.setPageSize(Number(e.target.value))
            }}
          >
            {[10, 25, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
              Show {pageSize}
              </option>
            ))}
          </select>
          <button
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'|<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>|'}
          </button>
        </div>
      </div>
    </>
  )
}
