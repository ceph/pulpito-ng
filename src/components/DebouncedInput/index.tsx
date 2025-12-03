import React from 'react'

import { type FilterComponentProps } from '#src/lib/types.d';

import './index.css';


export default function DebouncedInput (props: FilterComponentProps) {
  const [value, setValue] = React.useState(props.value)
  React.useEffect(() => {
    const timeout = setTimeout(() => { props.onChange(value) }, 500)
    return () => clearTimeout(timeout)
  }, [value]);
  return (
    <div className="debounced-input">
      { props.label? <label htmlFor={props.id}>{props.label}:</label> : null }
      <input
        type={props.type || 'text'}
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder={props.placeholder}
        list={props.options? props.id : undefined}
        autoComplete='off'
        size={6}
      />
      <button onClick={() => { setValue('') }}>
        ×
      </button>
      { props.options? <datalist id={props.id}>
        {
          props.options.map((option) => {
            if ( typeof option === 'object' ) return (<option value={option.value || ''}>{option.label}</option>)
            return (<option>{option}</option>)
          })
        }
      </datalist>
      : null }
    </div>
  )
}
