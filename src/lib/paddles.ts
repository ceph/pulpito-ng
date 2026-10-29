import axios from "axios";
import { render } from 'vike/abort'

import type {
  GetURLParams,
} from "./paddles.d";

import { isServer } from "./utils";
import { getRuntimeConfig } from "./config";

// Create axios instance with timeout configuration
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
});

const PADDLES_SERVER = (
  isServer()?
    process.env.VITE_PADDLES_SERVER || import.meta.env.VITE_PADDLES_SERVER :
    import.meta.env.VITE_PADDLES_SERVER
) || "https://paddles.front.sepia.ceph.com";

const MACHINE_TYPES = getRuntimeConfig().machineTypes;

// for queries which mention 'page', use this default page size if another is not specified.
const DEFAULT_PAGE_SIZE = 25;

// paddles' /runs/ endpoint filters via path segments, e.g. /runs/branch/main/suite/rados/
const RUN_FILTER_PARAMS = [
  'branch',
  'date',
  'flavors',
  'machine_type',
  'sha1',
  'status',
  'suite',
  'user',
];

// Endpoints that take 1-based 'page' and 'count' query parameters
const PAGED_ENDPOINT = /^\/(runs|jobs|nodes\/[^/]+\/jobs)\/?$/;

function getURL({endpoint, params} : GetURLParams) {
  const url = new URL(endpoint, PADDLES_SERVER);
  const isRuns = /^\/runs\/?$/.test(endpoint);
  const isPaged = PAGED_ENDPOINT.test(endpoint);
  const params_ = { ...params };
  // 'scheduled' is an older alias for 'date'
  if ( params_.scheduled && ! params_.date ) params_.date = params_.scheduled;
  delete params_.scheduled;
  const entries = Object.entries(params_);
  if ( isRuns ) {
    // paddles only understands 'flavors' as the first filter segment
    entries.sort(([a], [b]) => Number(b === "flavors") - Number(a === "flavors"));
  }
  entries.forEach(([key, value]) => {
    if ( [undefined, 'undefined', null, 'null', ''].includes(value) ) {
      return;
    }
    if ( isPaged && key === "page" ) {
      url.searchParams.set("page", String(Math.max(0, Math.floor(Number(value)) || 0) + 1));
    } else if ( isPaged && key === "pageSize" ) {
      url.searchParams.set("count", String(Number(value)));
    } else if ( isRuns ) {
      if ( key === "queued" ) {
        url.pathname += "/queued/";
      } else if ( RUN_FILTER_PARAMS.includes(key) ) {
        url.pathname += `/${key}/${encodeURIComponent(value)}/`;
      } else if ( ["fields", "since"].includes(key) ) {
        url.searchParams.set(key, value);
      }
      // anything else is not understood by paddles' /runs/; drop it
    } else if ( key === "owner" ) {
      url.searchParams.set("locked_by", value);
    } else {
      url.searchParams.set(key, value);
    }
  });
  if ( isPaged && ! url.searchParams.get("count") ) {
    url.searchParams.set("count", String(DEFAULT_PAGE_SIZE));
  }
  url.pathname = url.pathname.replace(/\/{2,}/g, '/');
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
      // Details were logged above; don't expose backend URLs to users.
      if ( err.response ) {
        throw render(err.response.status === 404 ? 404 : 503)
      }
      throw render(503)
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
