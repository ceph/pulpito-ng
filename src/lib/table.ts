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
    mrtTheme: {
      baseBackgroundColor: "#ffffff00",
    },
  }
}
