import {
  type Table as TanstackTable,
} from '@tanstack/react-table';

import './index.css';

export default function Paginator<TData> ({table}: {table: TanstackTable<TData>}) {
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const goToPage = (input: HTMLInputElement) => {
    const page = Math.floor(Number(input.value)) - 1;
    if ( Number.isNaN(page) || page < 0 || page === pageIndex ) return;
    table.setPageIndex(pageCount > 0 ? Math.min(page, pageCount - 1) : page);
  };
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
              max={pageCount > 0 ? pageCount : undefined}
              key={pageIndex}
              defaultValue={pageIndex + 1}
              onKeyDown={e => { if ( e.key === "Enter" ) goToPage(e.currentTarget) }}
            />
            { pageCount > 0 ? (
            <strong>
              of{' '}{pageCount}
            </strong>
            ) : null }
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
            type="button"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'|<'}
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          { pageCount > 0 ? (
          <button
            type="button"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>|'}
          </button>
          ) : null }
        </div>
      </div>
    </>
  )
}
