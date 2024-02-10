import { MRT_RowData, type MRT_TableOptions } from 'material-react-table';


export default function useDefaultTableOptions<TData extends MRT_RowData>(): Partial<MRT_TableOptions<TData>> {
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
