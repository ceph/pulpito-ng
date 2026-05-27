import axios from "axios";
import { render } from 'vike/abort'

import type {
  GetURLParams,
} from "./paddles.d";

import { isServer } from "./utils";

// Create axios instance with timeout configuration
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
});

const PADDLES_SERVER = (
  isServer()?
    process.env.VITE_PADDLES_SERVER || import.meta.env.VITE_PADDLES_SERVER :
    import.meta.env.VITE_PADDLES_SERVER
) || "https://paddles.front.sepia.ceph.com";

const _machine_types_str = (
  isServer()?
    process.env.VITE_MACHINE_TYPE || import.meta.env.VITE_MACHINE_TYPE :
    import.meta.env.VITE_MACHINE_TYPE
) || 'smithi,mira';
const MACHINE_TYPES = _machine_types_str.split(',')

// for queries which mention 'page', use this default page size if another is not specified.
const DEFAULT_PAGE_SIZE = 25;

const _searchParams = [
  'description',
  'fields',
  'locked',
  'machine_type',
  'os_type',
  'os_version',
  'owner',
  'up',
]

function getURL({endpoint, params} : GetURLParams) {
  const url = new URL(endpoint, PADDLES_SERVER);
  Object.entries(params || {}).forEach((entry) => {
    const [key, value] = entry;
    if ( [undefined, 'undefined', null, 'null', ''].includes(value) ) {
      return;
    }
    if ( endpoint === "/runs/") {
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
        case "scheduled":
          url.pathname += `/date/${value}`;
          break;
        case "owner":
          url.searchParams.set('locked_by', value);
          break;
        default:
          if ( _searchParams.includes(key) ) {
            url.searchParams.set(key, value);
          } else {
            url.pathname += `/${key}/${value}`;
          }
      }
    } else {
      url.searchParams.set(key, value);
    }
  });
  if ( endpoint && endpoint.match(/nodes\/.*\/jobs/) && ! url.searchParams.get("count") ) {
    url.searchParams.set("count", String(DEFAULT_PAGE_SIZE));
  };
  url.pathname = url.pathname.replace('//', '/');
  return url;
}

async function fetchPaddlesMultiple(requests: GetURLParams[]) {
  return Promise.all(requests.map((request) => {
    const url = getURL(request).toString();
    return axiosInstance.get(url).catch((err) => {
      // Log error with context for debugging
      const errorContext = {
        url,
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.message,
      };
      console.error('Paddles API request failed:', errorContext);
      throw err;
    });
  }))
    .catch((err) => {
      if ( err.response ) {
        const errorMsg = `Failed to fetch from ${err.config?.url || 'paddles'}: ${err.response.statusText}`;
        throw render(err.response.status, errorMsg)
      } else if ( err.code === 'ECONNABORTED' ) {
        throw render(503, `Request timeout: Could not reach the paddles backend at ${err.config?.url || 'paddles'}`)
      } else {
        throw render(503, `Could not reach the paddles backend: ${err.message}`)
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
