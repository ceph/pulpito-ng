import React from 'react'

import { type FilterComponentProps } from '#src/lib/types.d';

import './index.css';


export default function DebouncedInput (props: FilterComponentProps) {
  const [value, setValue] = React.useState(props.value ?? '')
  // Follow external changes (e.g. browser back/forward), but not the echo of
  // our own last change, which may arrive after the user has typed more.
  const synced = React.useRef(props.value ?? '');
  React.useEffect(() => {
    const v = props.value ?? '';
    if ( v !== synced.current ) { synced.current = v; setValue(v); }
  }, [props.value]);
  React.useEffect(() => {
    const timeout = setTimeout(() => { synced.current = value; props.onChange(value) }, 500)
    return () => clearTimeout(timeout)
  }, [value, props.onChange]);
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
      <button type="button" onClick={() => { setValue('') }}>
        ×
      </button>
      { props.options? <datalist id={props.id}>
        {
          props.options.map((option) => {
            if ( typeof option === 'object' ) return (<option key={option.value} value={option.value || ''}>{option.label}</option>)
            return (<option key={option}>{option}</option>)
          })
        }
      </datalist>
      : null }
    </div>
  )
}
