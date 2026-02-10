import React from 'react';

import DebouncedInput from '../DebouncedInput';
import FilterAutocomplete from '../FilterAutocomplete';
import FilterCheckbox from '../FilterCheckbox';
import FilterDate from '../FilterDate';
import FilterSelect from '../FilterSelect';
import { type FilterProps } from '#src/lib/types.d';
import { getFilterChangeHandler } from '#src/lib/utils';

import './index.css';

const DEFAULT_SIZE='8';

const components = new Map([
  ['native', DebouncedInput],
  ['mantine-select', FilterSelect],
  ['mantine-checkbox', FilterCheckbox],
  ['mantine-date', FilterDate],
  ['mantine-autocomplete', FilterAutocomplete],
])

export default function Filter (props: FilterProps) {
  const changeHandler = React.useMemo(() => getFilterChangeHandler(props.id), [])
  const Component = components.get(props.component || '' ) || FilterAutocomplete;
  return (
    <Component
      label={props.label}
      value={props.value}
      onChange={changeHandler}
      placeholder={props.placeholder}
      type={props.type || "text"}
      options={props.options}
      id={props.id}
      size={props.size || DEFAULT_SIZE}
    />
  )
}
