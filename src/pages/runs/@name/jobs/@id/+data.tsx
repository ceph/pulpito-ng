import type { PageContext } from 'vike/types'

import { fetchPaddles } from '#src/lib/paddles';

export default async function data(pageContext: PageContext) {
  const {name, id} = pageContext.routeParams;
  return fetchPaddles({
    endpoint: `/runs/${name}/jobs/${id}`,
    params: pageContext.urlParsed.search,
  });
}
