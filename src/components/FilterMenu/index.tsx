import TextField from "@mui/material/TextField";
import Autocomplete from '@mui/material/Autocomplete';
import type { FilterOptionsState } from "@mui/material/useAutocomplete";


interface FilterMenuProps {
  type: string;
  value: string;
  params: Record<string, string>;
  optionsHook: Function;
}


export default function FilterMenu({type, value, params, optionsHook}: FilterMenuProps) {
  const query = optionsHook();
  if (query.isError) console.error(query.error);
  const style = {textTransform: "capitalize"};
  const label = type.replaceAll("_", " ");
  const onChange = (_: any, newValue: string | null) => {
    // setter({[type]: newValue})
    // const newUrl = getUrl(context.urlPathname, updater(columnFilters), pagination);
    // navigate(newUrl.pathname + newUrl.search);
  };
  const filterOptions = (options: string[], { inputValue }: FilterOptionsState<string>) => {
    if (!inputValue) return options;
    let result: string[] = [];
    result.push(...options.filter((item) => item === inputValue));
    result.push(
      ...options.filter((item) => {
        if (result.indexOf(item) !== -1) return false;
        return item.startsWith(inputValue);
      })
    );
    result.push(
      ...options.filter((item) => {
        if (result.indexOf(item) !== -1) return false;
        return item.includes(inputValue);
      })
    );
    return result;
  };

  return (
    <Autocomplete
      value={value || null}
      filterOptions={filterOptions}
      autoHighlight
      autoSelect
      loading={query.isLoading}
      onChange={onChange}
      options={query.data || []}
      renderInput={(params) => <TextField {...params} label={label} />}
      size="small"
    />
  );
}
