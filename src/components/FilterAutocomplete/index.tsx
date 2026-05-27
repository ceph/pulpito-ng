import React from 'react';

import { Autocomplete } from '@mantine/core';

import { type FilterComponentProps } from '#src/lib/types.d';


export default function FilterAutocomplete(props: FilterComponentProps) {
  const [value, setValue] = React.useState(props.value)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      props.onChange(value);
    }, 500)
    return () => clearTimeout(timeout)
  }, [value, props.onChange]);
  // const label = props.type.replaceAll("_", " ");

  const options: string[] = [];
  (props.options || []).forEach(item => {
    if ( typeof item === 'object' ) {
      options.push(item.value || '')
    } else {
      options.push(item)
    }

  })
  return (
    <Autocomplete
      label={props.label}
      value={value}
      onChange={setValue}
      data={options}
      size="sm"
      comboboxProps={{ withinPortal: false }}
      inputSize={props.size}
      clearable
      autoSelectOnBlur
    />
  );
}
