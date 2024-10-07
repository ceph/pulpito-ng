import type { PageContext } from 'vike/types'

import { getURL } from "#src/lib/paddles";
import type { Node } from "#src/lib/paddles.d";

export type NodesResponse = {
  nodes: Node[];
}

export default async function data(pageContext: PageContext): Promise<NodesResponse> {
  const url = getURL('/nodes/', pageContext.urlParsed.search);
  const response = await fetch(url);
  if ( response.ok ) return {nodes: await response.json()};
  return {nodes: []};
}

