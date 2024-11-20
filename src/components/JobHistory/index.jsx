import JobList from "../JobList";
import { useJobHistory } from "../../lib/paddles";
import { Button, Typography, Box } from "@mui/material";


const pageSize = 25;

export default function JobHistory({description}) {
  if (!description) {
    return null;
  }
  
  const jobHistoryQuery = useJobHistory(description, pageSize);

  return (
    <Box sx={{ padding: '0px 8px' }}>
      <Typography variant="body1" margin={"10px 0px"}> 
        Past {pageSize} jobs with same description:
      </Typography>
      <JobList query={jobHistoryQuery} sortMode="time" />
    </Box>
  );
}
