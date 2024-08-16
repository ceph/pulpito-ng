export type QueryKey = [
  string,
  {
    url: string;
  }
];

export interface GetURLParams {
  [key: string]: string | number | null | undefined;
}

type RunParams = {
  name: string;
};

type NodeParams = {
  name: string;
};

export const JobStatuses = [
  "queued", "waiting", "running", "dead", "fail", "pass", "unknown",
] as const;

export type JobStatus = (typeof JobStatuses)[number];

export type Job = {
  id?: string;
  job_id: number;
  name: string;
  suite: string;
  branch: string;
  scheduled: string;
  posted: string;
  updated: string;
  started: string;
  log_href: string;
  sentry_event: string;
  duration: number;
  status: JobStatus;
  failure_reason: string;
  targets: Node[];
  roles: NodeRoles[];
  os_type: string;
  os_version: string;
};

export type NodeRoles = string[];

export const RunResultKeys = JobStatuses.concat(["total"]);
export type RunResult = (typeof RunResultKeys)[number];
export type RunResults = Record<RunResult, number>;

export const RunStatuses = [
  "queued", "waiting", "running", "finished dead", "finished fail", "finished pass"
] as const;

export type RunStatus = (typeof RunStatuses)[number];

export type Run = {
  name: string;
  branch: string;
  suite: string;
  jobs: Job[];
  scheduled: string;
  user: string;
  started: string;
  posted: string;
  updated: string;
  started: string;
  runtime: string;
  sha1: string | null;
  results: RunResults;
  machine_type: string;
  status: RunStatus;
};

export type Node = {
  name: string;
  description: string | null;
  up: boolean;
  locked: boolean;
  os_type: string;
  os_version: string;
  arch: string | null;
  locked_since: string | null;
  locked_by: string | null;
  machine_type: string;
};

export type NodeJobs = {
  jobs?: Job[];
}

export type StatsLocksResponse = {
  id: string;
  owner: string;
  machine_type: string;
  count: number;
}

export interface StatsJobsResponse {
  id: string;
  name: string;
  pass?: number;
  fail?: number;
  dead?: number;
  unknown?: number;
  running?: number;
  total: number;
}
