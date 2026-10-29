import type { PageContext } from 'vike/types'

import { fetchPaddles } from '#src/lib/paddles';

export default async function data(pageContext: PageContext) {
  return fetchPaddles({
    endpoint: '/runs/',
    params: pageContext.urlParsed.search,
  });
}
