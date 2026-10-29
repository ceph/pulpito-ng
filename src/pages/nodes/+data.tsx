import type { PageContext } from 'vike/types'

import { fetchPaddles } from "#src/lib/paddles";
import type { Node } from "#src/lib/paddles.d";

export type NodesResponse = {
  nodes: Node[],
}

export default async function data(pageContext: PageContext): Promise<NodesResponse> {
  const data: Node[] = await fetchPaddles(
    {endpoint: '/nodes/', params: pageContext.urlParsed.search},
  )
  return {'nodes': data}
}

