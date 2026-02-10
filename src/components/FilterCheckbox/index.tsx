import { Checkbox } from '@mantine/core';

import { type FilterComponentProps } from '#src/lib/types.d';

import './index.css';

export default function FilterCheckbox(props: FilterComponentProps) {
  return (
    <Checkbox
      label={props.label}
      labelPosition='left'
      checked={props.value?.toLocaleLowerCase() === 'true'? true : false}
      onChange={(event) => props.onChange(event.currentTarget.checked.toString())}
    />
  )
}
