import type { PageContext } from 'vike/types'

import { fetchPaddlesMultiple } from "#src/lib/paddles";
import type { Job, Node } from "#src/lib/paddles.d";

export type NodeResponse = {
  jobs: Job[];
  nodes: Node[];
}

export default async function data(pageContext: PageContext): Promise<NodeResponse> {
  const name = encodeURIComponent(pageContext.routeParams.name);
  const data = await fetchPaddlesMultiple([
    {endpoint: `/nodes/${name}/`},
    {endpoint: `/nodes/${name}/jobs/`, params: pageContext.urlParsed.search},
  ])
  return {nodes: [data[0]], jobs: data[1]}
}

