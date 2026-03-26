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
  // console.log(`cb ${props.label} value=${props.value} checked=${checked} indeterminate=${indeterminate}`)
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("e.checked", event.target.checked, "e.indet", event.target.indeterminate, "c", checked, "i", indeterminate)
    let value;
    if (event.currentTarget.checked === true && indeterminate === true) {
      value = "true";
    } else if (checked === true && event.target.checked === false) {
      // console.log("decision", checked, indeterminate)
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
