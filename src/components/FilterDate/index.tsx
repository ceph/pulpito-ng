import React from 'react';

import { DatePickerInput } from '@mantine/dates';

import { type FilterComponentProps } from '#src/lib/types.d';
import { getFilterChangeHandler } from '#src/lib/utils';


export default function FilterDate (props: FilterComponentProps) {
  const onChange = React.useMemo(() => getFilterChangeHandler(props.id), [])
  return (
    <DatePickerInput
      label={props.label}
      value={props.value}
      onChange={onChange}
      placeholder={props.placeholder}
      id={props.id}
      clearable
      popoverProps={{withinPortal: false}}
    />
  )
}
