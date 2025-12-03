import { navigate } from 'vike/client/router'
import TextField from "@mui/material/TextField";
import Autocomplete from '@mui/material/Autocomplete';
import type { FilterOptionsState } from "@mui/material/useAutocomplete";


interface FilterAutocompleteProps {
  type: string;
  value: string;
  baseUrl: string;
  options: string[];
}

export default function FilterAutocomplete({type, value, baseUrl, options}: FilterAutocompleteProps) {
  const label = type.replaceAll("_", " ");
  const onChange = (_: any, newValue: string | null) => {
    const newUrl = new URL(baseUrl, window.location.origin);
    if ( newValue ) {
      newUrl.searchParams.set(type, newValue || "");
    } else {
      newUrl.searchParams.delete(type);
    }
    navigate(newUrl.pathname + newUrl.search);
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
      onChange={onChange}
      options={options}
      renderInput={(params) => <TextField {...params} label={label} />}
      size="small"
    />
  );
}
