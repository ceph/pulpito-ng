import { Config } from 'vike-react/Config'
import { useData } from 'vike-react/useData'
import { Grid, Text, Title } from '@mantine/core';
import {
  IconCalendarMonth,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconFolder,
  IconPlayerPlay,
  IconQuestionMark,
} from '@tabler/icons-react';
import formatDuration from "date-fns/formatDuration";
import YAML from "json-to-pretty-yaml";

import Link from "#src/components/Link";
import CodeBlock from "#src/components/CodeBlock";
import type { Job, JobStatus } from "#src/lib/paddles.d";
import { getDuration, dirName, parseTimestamp } from "#src/lib/utils";


type StatusIconInfo = {
  icon: any,
  color?: string,
}

type StatusIconsInfo = {
  [key: string]: StatusIconInfo;
}


function StatusIcon({ status }: {status: JobStatus}) {
  const statuses: StatusIconsInfo = {
    pass: { icon: IconCircleCheck, color: "#4caf50" },
    fail: { icon: IconCircleX, color: "#ef5350" },
    dead: { icon: IconCircleX, color: "#ef5350" },
    running: { icon: IconPlayerPlay, color: "#ff9800" },
    queued: { icon: IconCalendarMonth },
    waiting: { icon: IconClock },
    unknown: { icon: IconQuestionMark },
  };
  const conf = statuses[status];
  if (!conf) return null;
  const Icon = conf.icon;
  const style: Record<string, string> = { alignSelf: "center", margin: "5px" };
  if (conf.color) style.color = conf.color;
  return <Icon style={style} />;
}

function timeSince(date: Date) {
  let minute = 60;
  let hour   = minute * 60;
  let day    = hour   * 24;
  let month  = day    * 30;
  let year   = day    * 365;

  let suffix = ' ago';

  let elapsed = Math.floor((Date.now() - Number(date)) / 1000);

  if (elapsed < minute) {
    return 'just now';
  }

  let a = elapsed < hour ? [Math.floor(elapsed / minute), 'minute'] :
          elapsed < day ? [Math.floor(elapsed / hour), 'hour'] :
          elapsed < month ? [Math.floor(elapsed / day), 'day'] :
          elapsed < year ? [Math.floor(elapsed / month), 'month'] :
          [Math.floor(elapsed / year), 'year'];

  return a[0] + ' ' + a[1] + (a[0] === 1 ? '' : 's') + suffix;
}

function JobHeader({ data }: { data: Job }) {
  return (
    <>
      <Grid.Col span={12} style={{ display: "flex" }}>
        <StatusIcon status={data.status} />
        <Title order={2}>
          <Link to={`/runs/${encodeURIComponent(data.name)}`}>{data.name}</Link>/{data.job_id}
        </Title>
      </Grid.Col>
      {data.log_href ? (
      <Grid.Col span={12} style={{ display: "flex" }}>
        <IconFolder style={{ alignSelf: "center", margin: "5px" }} />
        <Title order={3}>
          <Link to={dirName(data.log_href)}>Log Archive</Link>
        </Title>
      </Grid.Col>
      ) : null}
      {/*
        The job history link is disabled because crawlers following it on
        every job page caused expensive paddles queries during an outage:
        https://lists.ceph.io/hyperkitty/list/sepia@ceph.io/thread/R3NCP3HOQQOH23FVCNGHT77A73CWZZGX/
        The page itself still works. Consider re-enabling it for logged-in
        users only.
      <Grid.Col span={12}>
        <Link to={`/runs/${encodeURIComponent(data.name)}/jobs/${data.job_id}/history`}>Job History</Link>
      </Grid.Col>
      */}
      <Grid.Col span={4}>
        <Text>Status: {data.status}</Text>
        {data.started? (
          <Text suppressHydrationWarning>
            {timeSince(parseTimestamp(data.started))}
          </Text>
        ): null}
        {data.duration ? (
          <Text>
            Took {formatDuration(getDuration(data.duration))}
          </Text>
        ) : null}
      </Grid.Col>
      <Grid.Col span={4}>
        <Text>Ceph Branch: {data.branch}</Text>
        <Text>
          SHA1: <code>{data.sha1?.slice(0, 7)}</code>
        </Text>
        <Text>
          Teuthology Branch: {data.teuthology_branch}
        </Text>
      </Grid.Col>
      <Grid.Col span={4}>
        <Text>
          Nodes:&nbsp;
          {Object.keys(data.targets || []).map((item) => (
            <span key={item}>
              <Link
                to={`/nodes/${encodeURIComponent(item)}`}
              >
                {item.split(".")[0]}
              </Link>
              &nbsp;
            </span>
          ))}
        </Text>
        <Text>
          OS: {data.os_type} {data.os_version}
        </Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Text component="span">Description:&nbsp;</Text>
        <Text size="sm" component="span">
          <code>{data.description}</code>
        </Text>
      </Grid.Col>
      {data.failure_reason ? (
        <Grid.Col span={12}>
          <Text component="span">Failure reason:&nbsp;</Text>
            <code>{data.failure_reason}</code>
        </Grid.Col>
      ) : null}
    </>
  );
}

function JobDetails({ data }: {data: Job}) {
  const code = YAML.stringify(data);
  return (
    <CodeBlock value={code} language="yaml" />
  );
}

export default function JobPage() {
  const data: Job = useData();
  return (
    <>
      <Config title={`Job ${data.job_id} - Pulpito`} />
      <Grid>
        <JobHeader data={data} />
        <Grid.Col span={12}>
          <details
            style={{ marginTop: "20px" }}
          >
            <summary>
              <div>Full job details</div>
            </summary>
            <JobDetails data={data} />
          </details>
        </Grid.Col>
      </Grid>
    </>
  );
}
