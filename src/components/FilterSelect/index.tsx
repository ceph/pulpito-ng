import { Select } from '@mantine/core';

import { type FilterComponentProps } from '#src/lib/types.d';


export default function FilterSelect (props: FilterComponentProps) {
  const selectProps = Object.fromEntries(Object.entries(props));
  return (
    <Select
      onChange={props.onChange}
      comboboxProps={{ withinPortal: false }}
      {...selectProps}
    />
  )
}
