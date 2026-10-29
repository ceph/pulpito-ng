import React from 'react';

import { DatePickerInput } from '@mantine/dates';

import { type FilterComponentProps } from '#src/lib/types.d';
import { getFilterChangeHandler } from '#src/lib/utils';


export default function FilterDate (props: FilterComponentProps) {
  // 'scheduled' is the column id, but the URL parameter is 'date'
  const onChange = React.useMemo(() => getFilterChangeHandler('date', ['scheduled']), [])
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
