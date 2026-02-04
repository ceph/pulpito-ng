import React from 'react';

import { Autocomplete } from '@mantine/core';

import { type FilterComponentProps } from '#src/lib/types.d';


export default function FilterAutocomplete(props: FilterComponentProps) {
  const [value, setValue] = React.useState(props.value)
  if ( props.id === 'status' ) console.log('value state', props.id, value)
  React.useEffect(() => {
    if ( props.id === 'status' ) console.log('useEffect', props.id)
    const timeout = setTimeout(() => {
      if ( props.id === 'status' ) console.log('calling onChange', value);
      props.onChange(value);
    }, 500)
    if ( props.id === 'status' ) console.log('timeout', props.id, timeout)
    return () => clearTimeout(timeout)
  }, [value]);
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
