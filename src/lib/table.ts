import { MRT_RowData, type MRT_TableOptions } from 'material-react-table';
import { useTheme } from "@mui/material/styles";


export default function useDefaultTableOptions<TData extends MRT_RowData>(): Partial<MRT_TableOptions<TData>> {
  const theme = useTheme();
  const palette = theme.palette;
  return {
    layoutMode: "grid",
    defaultColumn: {
      minSize: 20,
      maxSize: 200,
      size: 75,
    },
    // enableColumnResizing: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    // enableRowSelection: true,
    initialState: {
        density: "compact",
        showColumnFilters: true,
    },
    mrtTheme: {
      baseBackgroundColor: theme.palette.background.default,
    },
    muiTableBodyCellProps: {
      sx: {
        color: "black",
        fontSize: "0.75rem",
        whiteSpace: "normal",
      }
    },
    muiTableBodyProps: {
      sx: {
        'tr td': {
          paddingBottom: '5px',
          paddingRight: 0,
          paddingTop: '5px',
          color: "black",
          borderLeft: "0.3px solid " + theme.palette.background.default,
        },
        'tr td:has(svg)': {
          padding: 0,
        },
        'tr td .MuiButtonBase-root': {color: "inherit"},
        'tr.error td': {
          backgroundColor: palette.error.main,
          color: palette.error.contrastText,
        },
        'tr.warning td': {
          backgroundColor: palette.warning.main,
          color: palette.error.contrastText,
        },
        'tr.info td': {backgroundColor: palette.info.main},
        'tr.success td': {backgroundColor: palette.success.main},
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
    muiTableBodyRowProps: {
      sx: {
        td: {color: theme.palette.primary.contrastText},
      },
    },
    muiTablePaperProps: {
      sx: {
        border: "1px solid " + theme.palette.grey[800],
      },
    },
  }
}
