import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import type { 
  GetURLParams, 
  Run, Job, 
  Node, JobList,
  StatsLocksResponse,
  StatsJobsResponse,
} from "./paddles.d";


const PADDLES_SERVER =
  import.meta.env.VITE_PADDLES_SERVER || "https://paddles.front.sepia.ceph.com";

function getURL(endpoint: string, params?: GetURLParams) {
  // Because paddles' API is clunky, we have to do extra work. If it were
  // more inuitive, we could replace everything until the next comment with
  // just these lines:
  //   const queryString = new URLSearchParams(params)).toString();
  //   let uri = queryString? `${endpoint}?${queryString}` : endpoint;
  const params_ = JSON.parse(JSON.stringify(params || {}));
  let uri = endpoint;
  let paramEntries = Object.entries(params_ || {});
  paramEntries.forEach((entry) => {
    const [key, value] = entry;
    if (value === null || value === "") {
      delete params_[key];
      return;
    }
    switch (key) {
      case "page":
        params_[key] = Number(value) + 1;
        break;
      case "pageSize":
        params_.count = Number(value);
        delete params_[key];
        break;
      case "queued":
        uri += "queued/";
        delete params_[key];
        break;
      case "description":
          break;
      case "machine_type":
        break;
      default:
        uri += `${key}/${value}/`;
        delete params_[key];
    }
  });
  const queryString = new URLSearchParams(params_).toString();
  if (queryString) uri += `?${queryString}`;
  // end "we could replace everything..."
  return new URL(uri, PADDLES_SERVER).href;
}

function useRuns(params: GetURLParams): UseQueryResult<Run[]> {
  let baseUrl = "/runs/";
  const params_ = { ...params };
  if (params_.pageSize) {
    params_.count = params.pageSize;
    delete params_.pageSize;
  }
  if (params_.machine_type) {
    // this is to handle difference in machine_type filter
    // in two endpoints /node/?machine_type=xyz and /runs/machine_type/xyz
    baseUrl += "machine_type/" + params_.machine_type + "/";
    delete params_.machine_type;
  }
  const url = getURL(baseUrl, params);
  const query = useQuery(["runs", { url }], {
    select: (data: Run[]) =>
      data.map((item) => {
        return { ...item, id: item.name };
      }),
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

function useJobHistory(description: string, pageSize: number): UseQueryResult<JobList> {
  const url = getURL(`/jobs/`, { 'description': description, "pageSize": pageSize });
  const query = useQuery(["job-history", { url }], {
    select: (data: Job[]) => {
      data.forEach((item) => {
        item.id = item.job_id + "";
      });
      const resp: JobList = { 'jobs': data }
      return resp;
    },
    cacheTime: 60 * 60,
    staleTime: 60 * 60,
    retry: 1,
  });
  return query;
}

function useNodeJobs(name: string, params: GetURLParams): UseQueryResult<JobList> {
  // 'page' and 'count' are mandatory query params for this paddles endpoint
  params = { "page": params?.page || 0, "pageSize": params?.pageSize || 25 }  
  const url = getURL(`/nodes/${name}/jobs/`, params);
  const query = useQuery(["nodeJobs", { url }], {
    select: (data: Job[]) => {
      data.forEach((item) => {
        item.id = item.job_id + "";
      });
      const resp: JobList = { 'jobs': data }
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
  const url = getURL(`/nodes/`, {machine_type});
  const query = useQuery(["nodes", { url }], {
    select: (data: Node[]) =>
      data.map((item) => {
        item["description"] = (item['description'] || "").split('/').slice(-2).join('/');
        return { ...item, id: item.name };
      }),
  });
  return query;
}

function useStatsNodeLocks(params: GetURLParams): UseQueryResult<StatsLocksResponse[]> {
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

function useStatsNodeJobs(params: GetURLParams): UseQueryResult<StatsJobsResponse[]> {
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
  useJobHistory,
};
