import { Config } from 'vike-react/Config'
import { useData } from 'vike-react/useData'
import Grid from '@mui/material/Grid2';
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FolderIcon from '@mui/icons-material/Folder';
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ScheduleIcon from "@mui/icons-material/Schedule";
import formatDuration from "date-fns/formatDuration";
import YAML from "json-to-pretty-yaml";

import Link from "#src/components/Link";
import CodeBlock from "#src/components/CodeBlock";
import type { Job, JobStatus } from "#src/lib/paddles.d";
import { getDuration, dirName } from "#src/lib/utils";


type StatusIconInfo = {
  icon: any,
  color?: string,
}

type StatusIconsInfo = {
  [key: string]: StatusIconInfo;
}


function StatusIcon({ status }: {status: JobStatus}) {
  const statuses: StatusIconsInfo = {
    pass: { icon: CheckCircleOutlineIcon, color: "var(--mui-palette-success-light)" },
    fail: { icon: HighlightOffIcon, color: "var(--mui-palette-error-light)" },
    dead: { icon: HighlightOffIcon, color: "var(--mui-palette-error-light)" },
    running: { icon: PlayCircleOutlineIcon, color: "var(--mui-palette-warning-light)" },
    queued: { icon: CalendarMonthIcon },
    waiting: { icon: ScheduleIcon },
    unknown: { icon: QuestionMarkIcon },
  };
  const conf = statuses[status];
  if (!conf) return null;
  const Icon = conf.icon;
  const style: Record<string, string> = { alignSelf: "center", margin: "5px" };
  if (conf.color) style.color = conf.color;
  return <Icon style={style} />;
}

function timeSince(date: Date) {
  // const parsedDate = parse(date, "yyyy-MM-dd HH:mm:ss", new Date());
  // if (!isValid(parsedDate)) {
  //   return 'N/A';
  // }

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
      <Grid size={12} style={{ display: "flex" }}>
        <StatusIcon status={data.status} />
        <Typography variant="h5">
          <Link to={`/runs/${data.name}`}>{data.name}</Link>/{data.job_id}
        </Typography>
      </Grid>
      <Grid size={12} style={{ display: "flex" }}>
        <FolderIcon sx={{ alignSelf: "center", margin: "5px" }} />
        <Typography variant="h5">
          <Link to={dirName(data.log_href)}>Log Archive</Link>
        </Typography>
      </Grid>
      <Grid size={4}>
        <Typography>Status: {data.status}</Typography>
        <Typography>
          {timeSince(new Date(data.started))}
        </Typography>
        {data.duration ? (
          <Typography>
            Took {formatDuration(getDuration(data.duration))}
          </Typography>
        ) : null}
      </Grid>
      <Grid size={4}>
        <Typography>Ceph Branch: {data.branch}</Typography>
        <Typography>
          SHA1: <code>{data.sha1.slice(0, 7)}</code>
        </Typography>
        <Typography>
          Teuthology Branch: {data.teuthology_branch}
        </Typography>
      </Grid>
      <Grid size={4}>
        <Typography>
          Nodes:&nbsp;
          {Object.keys(data.targets || []).map((item) => (
            <span key={item}>
              <Link
                to={`/nodes/${item}`}
              >
                {item.split(".")[0]}
              </Link>
              &nbsp;
            </span>
          ))}
        </Typography>
        <Typography>
          OS: {data.os_type} {data.os_version}
        </Typography>
      </Grid>
      <Grid size={12}>
        <Typography component="span">Description:&nbsp;</Typography>
        <Typography variant="body2" component="span">
          <code>{data.description}</code>
        </Typography>
      </Grid>
      {data.failure_reason ? (
        <Grid size={12}>
          <Typography component="span">Failure reason:&nbsp;</Typography>
          <Typography variant="body2" component="span">
            <code>{data.failure_reason}</code>
          </Typography>
        </Grid>
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

export default function Job() {
  const data: Job = useData();
  return (
    <Grid container spacing={2}>
      <Config title={`Job ${data.job_id} - Pulpito`} />
      <JobHeader data={data} />
      <Grid size={12}>
        <details
          style={{ marginTop: "20px" }}
        >
          <summary>
            <Typography>Full job details</Typography>
          </summary>
            <JobDetails data={data} />
        </details>
      </Grid>
    </Grid>
  );
}
