import axios from "axios";
import { render } from 'vike/abort'

import type { 
  GetURLParams,
} from "./paddles.d";


const PADDLES_SERVER =
  import.meta.env.VITE_PADDLES_SERVER || "https://paddles.front.sepia.ceph.com";

const _machine_types_str: string = import.meta.env.VITE_MACHINE_TYPE || 'smithi,mira';
const MACHINE_TYPES = _machine_types_str.split(',')

// for queries which mention 'page', use this default page size if another is not specified.
const DEFAULT_PAGE_SIZE = 25;

function getURL({endpoint, params} : GetURLParams) {
  const url = new URL(endpoint, PADDLES_SERVER);
  Object.entries(params || {}).forEach((entry) => {
    const [key, value] = entry;
    if ( [undefined, 'undefined', null, 'null', ''].includes(value) ) {
      return;
    }
    switch (key) {
      case "page":
        url.searchParams.set(key, String(Number(value) + 1));
        break;
      case "pageSize":
        url.searchParams.set("count", String(Number(value)));
        break;
      case "queued":
        url.pathname += "/queued/";
        break;
      case "description":
        url.searchParams.set("description", value)
        break;
      case "fields":
        url.searchParams.set("fields", value)
        break
      case "machine_type":
        url.searchParams.set("machine_type", value);
        break;
      case 'locked':
        url.searchParams.set(key, value);
        break
      case 'up':
        url.searchParams.set(key, value);
        break
      case "scheduled":
        url.pathname += `/date/${value}`;
        break;
      default:
        url.pathname += `/${key}/${value}`;
    }
  });
  if ( ! url.searchParams.get("count") ) {
    url.searchParams.set("count", String(DEFAULT_PAGE_SIZE));
  };
  url.pathname = url.pathname.replace('//', '/');
  return url;
}

async function fetchPaddlesMultiple(requests: GetURLParams[]) {
  return Promise.all(requests.map((request) => axios.get(getURL(request).toString())))
    .catch((err) => {
      if ( err.response ) {
        throw render(err.response.status, err.response.statusText)
      } else {
        throw render(503, "Could not reach the paddles backend!")
      }
    })
    .then((responses) => responses.map((response) => response.data))
}

async function fetchPaddles<TData>({endpoint, params}: GetURLParams): Promise<TData> {
  return fetchPaddlesMultiple([{endpoint, params}])
    .then(data => data[0])
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

function useStatsNodeLocks(params: URLSearchParams): UseQueryResult<StatsLocksResponse[]> {
  const params_ = JSON.parse(JSON.stringify(params || {}));
  params_["up"] = "True"

  const queryString = new URLSearchParams(params_).toString();
  let uri = `nodes/?${queryString}`;
  const url = new URL(uri, PADDLES_SERVER).href

  const query = useQuery({
    queryKey: ["statsLocks", { url }],

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
    }
  });
  return query;
}

export {
  DEFAULT_PAGE_SIZE,
  MACHINE_TYPES,
  getURL,
  useStatsNodeLocks,
  useJobHistory,
  fetchPaddles,
  fetchPaddlesMultiple,
};
