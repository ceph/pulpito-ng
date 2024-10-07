import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'

const machineTypes = [
  "smithi",
  "mira",
]

export default function MachineTypeSelector() {
  const context = usePageContext();
  const selected = context.urlParsed.search.machine_type;

  const getUrl = (machine_type: string) => {
    const newUrl = new URL(context.urlPathname, window.location.origin);
    newUrl.searchParams.set("machine_type", machine_type);
    return newUrl;
  };
  const onChange = (value: string) => {
    const newUrl = getUrl(value);
    navigate(newUrl.pathname + newUrl.search);

  };
  return (
    <>
      <span>Machine Type</span>
      <select onChange={e => onChange(e.target.value)}>
        { machineTypes.includes(selected)? null : <option value={selected}>{selected}</option> }
        { machineTypes.map(value => {
          const isSelected = value === selected? {"selected": true} : {}
          return <option value={value} key={value} {...isSelected}>{value}</option>
        }) }
      </select>
    </>
  )
}
