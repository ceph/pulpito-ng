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
      case 'os_type':
        url.searchParams.set(key, value);
        break
      case 'os_version':
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
  if ( endpoint && endpoint.match(/nodes\/.*\/jobs/) && ! url.searchParams.get("count") ) {
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

export {
  DEFAULT_PAGE_SIZE,
  MACHINE_TYPES,
  getURL,
  fetchPaddles,
  fetchPaddlesMultiple,
};
