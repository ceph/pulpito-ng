import type { PageContext } from 'vike/types'
import { redirect, render } from 'vike/abort'

// Run names look like <user>-<yyyy-mm-dd>_<hh:mm:ss>-...
const RUN_NAME = /-\d{4}-\d{2}-\d{2}_\d{2}:\d{2}:\d{2}-/;

// Old pulpito URLs: /<run_name>/<job_id>/
export function guard(pageContext: PageContext) {
  const { run_name, job_id } = pageContext.routeParams;
  if ( ! RUN_NAME.test(run_name) || ! /^\d+$/.test(job_id) ) throw render(404);
  throw redirect(`/runs/${encodeURIComponent(run_name).replaceAll("%3A", ":")}/jobs/${encodeURIComponent(job_id)}`, 301);
}
