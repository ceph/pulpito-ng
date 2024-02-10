import type { PageContext } from 'vike/types'
import { render } from 'vike/abort'

import { getURL } from "#src/lib/paddles";

export default async function data(pageContext: PageContext) {
  const url = getURL(`/runs/${pageContext.routeParams.name}`, pageContext.urlParsed.search);
  const response = await fetch(url);
  if ( response.ok ) return await response.json();
  else if (response.status === 404) throw render(
    response.status,
    `Run "${pageContext.routeParams.name}" does not exist`
  );
}
