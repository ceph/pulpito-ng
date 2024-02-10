import type { PageContext } from 'vike/types'

import { getURL } from "#src/lib/paddles";

export default async function data(pageContext: PageContext) {
  const url = getURL(`/runs/${pageContext.routeParams.name}`, pageContext.urlParsed.search);
  const response = await fetch(url);
  return await response.json();
}
