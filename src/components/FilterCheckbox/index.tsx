import { useCallback } from 'react';

import { Checkbox } from '@mantine/core';

import { type FilterComponentProps } from '#src/lib/types.d';

import './index.css';

export default function FilterCheckbox(props: FilterComponentProps) {
  let checked: boolean;
  let indeterminate: boolean = false;
  switch (props.value?.toLocaleLowerCase()) {
    case "true":
      checked = true;
      break;
    case "false":
      checked = false;
      break;
    default:
      checked = false;
      indeterminate = true;
  }
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | null;
    if (event.currentTarget.checked === true && indeterminate === true) {
      value = "true";
    } else if (checked === true && event.target.checked === false) {
      value = "false";
    } else {
      value = null;
    }
    return props.onChange(value);
  }, [props.onChange, checked, indeterminate]);

  return (
    <Checkbox
      label={props.label}
      labelPosition='left'
      indeterminate={indeterminate}
      checked={checked}
      onChange={onChange}
    />
  )
}
