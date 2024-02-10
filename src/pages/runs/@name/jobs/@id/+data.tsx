import type { PageContext } from 'vike/types'

import { getURL } from "#src/lib/paddles";

export default async function data(pageContext: PageContext) {
  const {name, id} = pageContext.routeParams;
  const url = getURL(`/runs/${name}/jobs/${id}`, pageContext.urlParsed.search);
  const response = await fetch(url);
  return await response.json();
}
