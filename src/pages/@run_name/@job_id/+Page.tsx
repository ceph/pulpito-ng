import { usePageContext } from 'vike-react/usePageContext'

import { isServer } from "#src/lib/utils";


export default function Page () {
  if ( ! isServer() ) {
    const context = usePageContext();
    const {run_name, job_id} = context.routeParams;
    window.location.pathname = `/runs/${run_name}/jobs/${job_id}`
  }
}
