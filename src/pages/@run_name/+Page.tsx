import { usePageContext } from 'vike-react/usePageContext'

import { isServer } from "#src/lib/utils";


export default function Page () {
  if ( ! isServer() ) {
    const context = usePageContext();
    const run_name = context.routeParams.run_name;
    window.location.pathname = `/runs/${run_name}`
  }
}
