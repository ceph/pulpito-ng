import React from 'react';

import { Autocomplete } from '@mantine/core';

import { type FilterComponentProps } from '#src/lib/types.d';


export default function FilterAutocomplete(props: FilterComponentProps) {
  const [value, setValue] = React.useState(props.value ?? '')
  // Follow external changes (e.g. browser back/forward), but not the echo of
  // our own last change, which may arrive after the user has typed more.
  const synced = React.useRef(props.value ?? '');
  React.useEffect(() => {
    const v = props.value ?? '';
    if ( v !== synced.current ) { synced.current = v; setValue(v); }
  }, [props.value]);
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      synced.current = value;
      props.onChange(value);
    }, 500)
    return () => clearTimeout(timeout)
  }, [value, props.onChange]);

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
