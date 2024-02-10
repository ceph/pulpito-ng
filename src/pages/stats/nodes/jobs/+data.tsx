import type { PageContext } from 'vike/types'

import { getURL } from "#src/lib/paddles";
import { type StatsJobsResponse } from "#src/lib/paddles.d";

export default async function data(pageContext: PageContext) {
  const url = getURL("/nodes/job_stats/", pageContext.urlParsed.search);
  const response = await fetch(url);
  const data = await response.json();
  let resp = [];
  for (let node in data) {
    let name = node;
    let status_dict = data[node];
    let respObj: StatsJobsResponse = { 
      id: name, name, 'total': 0,
      'pass': status_dict['pass'] || 0, 
      'fail': status_dict['fail'] || 0, 
      'dead': status_dict['dead'] || 0, 
      'unknown': status_dict['unknown'] || 0, 
      'running': status_dict['running'] || 0,  
    };
    for (let status in status_dict) {
      respObj["total"] += status_dict[status] || 0;
    }
    resp.push(respObj)
  }
  return resp;
}


