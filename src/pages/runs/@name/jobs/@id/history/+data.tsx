import type { PageContext } from 'vike/types'

import { fetchPaddles } from '#src/lib/paddles';
import { Job } from '#src/lib/paddles.d';

export default async function data(pageContext: PageContext) {
  const {name, id} = pageContext.routeParams;
  const job: Job = await fetchPaddles({
    endpoint: `/runs/${encodeURIComponent(name)}/jobs/${encodeURIComponent(id)}/`,
    // The below has no effect for now, but would if we implemented it in paddles
    params: { fields: 'description' },
  });
  return {
    description: job.description,
    jobs: await fetchPaddles({
      endpoint: '/jobs/',
      params: { description: job.description, ...pageContext.urlParsed.search },
    })
  }
}
