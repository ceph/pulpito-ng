import type { PageContext } from 'vike/types'
import { redirect, render } from 'vike/abort'

// Run names look like <user>-<yyyy-mm-dd>_<hh:mm:ss>-...
const RUN_NAME = /-\d{4}-\d{2}-\d{2}_\d{2}:\d{2}:\d{2}-/;

// Old pulpito URLs: /<run_name>/
export function guard(pageContext: PageContext) {
  const { run_name } = pageContext.routeParams;
  if ( ! RUN_NAME.test(run_name) ) throw render(404);
  throw redirect(`/runs/${encodeURIComponent(run_name).replaceAll("%3A", ":")}`, 301);
}
