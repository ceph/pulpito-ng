import type { PageContext } from 'vike/types'

import { fetchPaddles } from '#src/lib/paddles';
import { type Node } from '#src/lib/paddles.d';
import { type NodeLockStats } from '#src/lib/types.d';

export default async function data(pageContext: PageContext) {
  const data: Node[] = await fetchPaddles({
    endpoint: '/nodes/',
    params: pageContext.urlParsed.search,
  });
  let users = new Map();
  data.forEach((node) => {
    let owner: string = node["locked"] ? (node["locked_by"] || "-") : "(free)";
    let mtype: string = node["machine_type"] || "None";
    let mtype_dict = users.get(owner) || new Map();
    let mcount = mtype_dict.get(mtype) + 1 || 0 + 1;
    mtype_dict.set(mtype, mcount);
    users.set(owner, mtype_dict);
  });
  let result: NodeLockStats[] = [];
  users.forEach(((mtype_dict: Map<string, number>, owner: string) => {
    mtype_dict.forEach((mcount: number, mtype: string) => {
      result.push({ name: owner + mtype, owner, machine_type: mtype, count: mcount })
    })
  }));
  return result
}


