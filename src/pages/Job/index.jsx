import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
// import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import FolderIcon from '@mui/icons-material/Folder';
import formatDuration from "date-fns/formatDuration";
import { isValid, parse } from "date-fns";
import "prismjs/themes/prism-tomorrow.css";
import { Helmet } from "react-helmet";
import YAML from "json-to-pretty-yaml";

import Link from "../../components/Link";
import CodeBlock from "../../components/CodeBlock";
import { useJob } from "../../lib/paddles";
import { getDuration, dirName } from "../../lib/utils";

function StatusIcon({ status }) {
  const theme = useTheme();
  const statuses = {
    pass: { icon: CheckCircleOutlineIcon, color: theme.palette.success.light },
    fail: { icon: HighlightOffIcon, color: theme.palette.error.light },
    dead: { icon: HighlightOffIcon, color: theme.palette.warning.light },
    running: {
      icon: PlayCircleOutlineIcon,
      theme: theme.palette.warning.light,
    },
    waiting: { icon: ScheduleIcon },
  };
  const conf = statuses[status];
  if (!conf) return null;
  const Icon = conf.icon;
  const style = { alignSelf: "center", margin: "5px" };
  if (conf.color) style.color = conf.color;
  return <Icon style={style} />;
}

function timeSince(date) {
  const parsedDate = parse(date, "yyyy-MM-dd HH:mm:ss", new Date());
  if (!isValid(parsedDate)) {
    return 'N/A';
  }

  let minute = 60;
  let hour   = minute * 60;
  let day    = hour   * 24;
  let month  = day    * 30;
  let year   = day    * 365;

  let suffix = ' ago';

  let elapsed = Math.floor((Date.now() - date) / 1000);

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

function JobHeader({ query }) {
  if (!query.isSuccess) return null;
  return (
    <>
      <Grid item xs={12} style={{ display: "flex" }}>
        <StatusIcon status={query.data?.status} />
        <Typography variant="h5">
          <Link to={`/runs/${query.data.name}`}>{query.data.name}</Link>/{query.data.job_id}
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ display: "flex" }}>
        <FolderIcon sx={{ alignSelf: "center", margin: "5px" }} />
        <Typography variant="h5">
          <Link to={dirName(query.data.log_href)}>Log Archive</Link>
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography>Status: {query.data.status}</Typography>
        <Typography>
          {timeSince(new Date(query.data.started))}
        </Typography>
        {query.data.duration ? (
          <Typography>
            Took {formatDuration(getDuration(query.data.duration))}
          </Typography>
        ) : null}
      </Grid>
      <Grid item xs={4}>
        <Typography>Ceph Branch: {query.data.branch}</Typography>
        <Typography>
          SHA1: <code>{query.data.sha1.slice(0, 7)}</code>
        </Typography>
        <Typography>
          Teuthology Branch: {query.data.teuthology_branch}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography>
          Nodes:&nbsp;
          {Object.keys(query.data.targets || []).map((item) => (
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
          OS: {query.data.os_type} {query.data.os_version}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography component="span">Description:&nbsp;</Typography>
        <Typography variant="body2" component="span">
          <code>{query.data.description}</code>
        </Typography>
      </Grid>
      {query.data.failure_reason ? (
        <Grid item xs={12}>
          <Typography component="span">Failure reason:&nbsp;</Typography>
          <Typography variant="body2" component="span">
            <code>{query.data.failure_reason}</code>
          </Typography>
        </Grid>
      ) : null}
    </>
  );
}

function JobDetails({ query }) {
  if (query.isLoading) return "...";
  if (query.isError) return "!!!";
  const code = YAML.stringify(query.data);
  return (
    <CodeBlock value={code} language="yaml" />
  );
}

export default function Job() {
  const { name, job_id } = useParams();
  const query = useJob(name, job_id);

  return (
    <Grid container spacing={2}>
      <Helmet>
        <title>{`Job ${job_id} - Pulpito`}</title>
      </Helmet>
      <JobHeader query={query} />
      <Grid item xs={12}>
        <Accordion
          TransitionProps={{ unmountOnExit: true }}
          style={{ marginTop: "20px" }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Full job details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <JobDetails query={query} />
          </AccordionDetails>
        </Accordion>
        
      </Grid>
    </Grid>
  );
}
