import axios from "axios";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { QueryOptions, UseQueryResult, UseSuspenseQueryResult } from "@tanstack/react-query";

import type { 
  Run, Job, 
  Node, NodeJobs,
  StatsLocksResponse,
  StatsJobsResponse,
} from "./paddles.d";


const PADDLES_SERVER =
  import.meta.env.VITE_PADDLES_SERVER || "https://paddles.front.sepia.ceph.com";

async function queryFn (params: QueryOptions) {
  const queryKey = params.queryKey as [string, { url: string}];
  return axios.get(queryKey[1].url).then((resp) => resp.data);
}

function getURL(endpoint: string, params?: Record<string, string>) {
  const url = new URL(endpoint, PADDLES_SERVER);
  let uri = endpoint;
  Object.entries(params).forEach((entry) => {
    const [key, value] = entry;
    if (value === null || value === "") {
      return;
    }
    switch (key) {
      case "page":
        url.searchParams.set(key, Number(value) + 1);
        break;
      case "pageSize":
        url.searchParams.set("count", Number(value));
        break;
      case "queued":
        url.pathname += "/queued/";
        break;
      case "machine_type":
        url.searchParams.set("machine_type", value);
        break;
      default:
        url.pathname += `/${key}/${value}/`;
    }
  });
  return url;
}

function useRuns(params: Record<string, string>): UseQueryResult<Run[]> {
  console.log("useRuns", params)
  const params_ = Object.fromEntries(Object.entries(params));
  const url = getURL("/runs/", params_);
  const query = useQuery({
    queryKey: ["runs", { url }],
    // queryFn: queryFn,
    select: (data: Run[]) =>
      data.map((item) => {
        return { ...item, id: item.name };
      })
    ,
  });
  return query;
}

function useRun(name: string): UseQueryResult<Run> {
  const url = getURL(`/runs/${name}/`);
  const query = useQuery<Run, Error>(["run", { url }], {
    select: (data: Run) => {
      data.jobs.forEach((item) => {
        item.id = item.job_id + "";
      });
      return data;
    },
  });
  return query;
}

function useJob(name: string, job_id: number): UseQueryResult<Job> {
  const url = getURL(`/runs/${name}/jobs/${job_id}/`);
  const query = useQuery<Job, Error>(["job", { url }], {});
  return query;
}

function useBranches() {
  const url = getURL("/runs/branch/");
  return useQuery(["branches", { url }]);
}

function useSuites() {
  const url = getURL("/runs/suite/");
  return useQuery(["suites", { url }]);
}

function useMachineTypes() {
  const url = getURL("/nodes/machine_types/");
  return useQuery(["machine_types", { url }], {
    cacheTime: 60 * 60 * 24 * 30,
    staleTime: 60 * 60 * 24 * 30,
  });
}

function useNodeJobs(name: string, params: URLSearchParams): UseQueryResult<NodeJobs> {
  // 'page' and 'count' are mandatory query params for this paddles endpoint
  const url = getURL(`/nodes/${name}/jobs/`, params);
  const query = useQuery(["nodeJobs", { url }], {
    select: (data: Job[]) => {
      data.forEach((item) => {
        item.id = item.job_id + "";
      });
      const resp: NodeJobs = { 'jobs': data }
      return resp;
    },
  });
  return query;
}

function useNode(name: string): UseQueryResult<Node[]> {
  const url = getURL(`/nodes/${name}/`);
  const query = useQuery(["node", { url }], {
    select: (node: Node) => {
        node["description"] = (node['description'] || "").split('/').slice(-2).join('/');
        return [{ ...node, id: node.name }];
      }
    });
  return query;
}

function useNodes(machine_type: string): UseQueryResult<Node[]> {
  const url = getURL(`/nodes/`, new URLSearchParams({machine_type}));
  const query = useQuery(["nodes", { url }], {
    select: (data: Node[]) =>
      data.map((item) => {
        item["description"] = (item['description'] || "").split('/').slice(-2).join('/');
        return { ...item, id: item.name };
      }),
  });
  return query;
}

function useStatsNodeLocks(params: URLSearchParams): UseQueryResult<StatsLocksResponse[]> {
  const params_ = JSON.parse(JSON.stringify(params || {}));
  params_["up"] = "True"

  const queryString = new URLSearchParams(params_).toString();
  let uri = `nodes/?${queryString}`;
  const url = new URL(uri, PADDLES_SERVER).href

  const query = useQuery(["statsLocks", { url }], {
    select: (data: Node[]) => {
      let users = new Map();
      data.forEach((node) => {
        let owner: string = node["locked"] ? (node["locked_by"] || "-") : "(free)";
        let mtype: string = node["machine_type"] || "None";
        let mtype_dict = users.get(owner) || new Map();
        let mcount = mtype_dict.get(mtype) + 1 || 0 + 1;
        mtype_dict.set(mtype, mcount);
        users.set(owner, mtype_dict);
      });
      let resp: StatsLocksResponse[] = [];
      users.forEach(((mtype_dict: Map<string, number>, owner: string) => {
        mtype_dict.forEach((mcount: number, mtype: string) => {
          resp.push({ id: owner + mtype, owner, machine_type: mtype, count: mcount })
        })
      }));
      return resp;
    },
  });
  return query;
}

function useStatsNodeJobs(params: URLSearchParams): UseQueryResult<StatsJobsResponse[]> {
  const params_ = JSON.parse(JSON.stringify(params || {}));
  params_["since_days"] = params_["since_days"] || 14;

  const queryString = new URLSearchParams(params_).toString();
  let uri = `nodes/job_stats/?${queryString}`;
  const url = new URL(uri, PADDLES_SERVER).href;

  const query = useQuery(["statsJobs", { url }], {
    select: (data: {[name: string]: { [status: string]: number }}) => {
      let resp: StatsJobsResponse[] = [];
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
    },
  });
  return query;
}

function useStatuses() {
  return {
    data: [
      "queued",
      "waiting",
      "running",
      "finished pass",
      "finished fail",
      "finished dead",
    ],
  };
}

export {
  getURL,
  queryFn,
  useBranches,
  useMachineTypes,
  useRuns,
  useRun,
  useJob,
  useSuites,
  useStatuses,
  useNode,
  useNodeJobs,
  useNodes,
  useStatsNodeLocks,
  useStatsNodeJobs,
};
