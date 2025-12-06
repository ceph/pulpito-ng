import type { PageContext } from 'vike/types'

import { fetchPaddles } from "#src/lib/paddles";
import { type NodeJobStatsResponse } from "#src/lib/paddles.d";
import { type NodeJobStats } from '#src/lib/types.d';

export default async function data(pageContext: PageContext) {
  const data: NodeJobStatsResponse = await fetchPaddles({
    endpoint: '/nodes/job_stats/',
    params: pageContext.urlParsed.search,
  })

  let result: NodeJobStats[] = []
  for (let node in data) {
    let nodeResult = {
      name: node,
      pass: data[node]['pass'] || 0,
      dead: data[node]['dead'] || 0,
      fail: data[node]['fail'] || 0,
      running: data[node]['running'] || 0,
      unknown: data[node]['unknown'] || 0,
      total: Object.values(data[node]).reduce(
        (accumulator, currentValue) => accumulator + currentValue, 0),
    }
    result.push(nodeResult)
  }
  return result
}


