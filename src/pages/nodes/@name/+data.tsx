import type { PageContext } from 'vike/types'
import { render } from 'vike/abort'

import { getURL } from "#src/lib/paddles";
import type { Job, Node } from "#src/lib/paddles.d";

export type NodeResponse = {
  jobs: Job[];
  nodes: Node[];
}

export default async function data(pageContext: PageContext): Promise<NodeResponse> {
  const nodeUrl = getURL(`/nodes/${pageContext.routeParams.name}`, pageContext.urlParsed.search);
  const jobsUrl = getURL(`/nodes/${pageContext.routeParams.name}/jobs`, pageContext.urlParsed.search);
  const [nodeResponse, jobsResponse] = await Promise.all([fetch(nodeUrl), fetch(jobsUrl)]);
  const result: NodeResponse = {jobs: [], nodes: []};
  if ( nodeResponse.status === 404 ) throw render(
    nodeResponse.status,
    `Node "${pageContext.routeParams.name}" does not exist`
  );
  else if ( nodeResponse.ok ) result.nodes = [await nodeResponse.json()];
  if ( jobsResponse.ok ) result.jobs = await jobsResponse.json();
  return result;
}

