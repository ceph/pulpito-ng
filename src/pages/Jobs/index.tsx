import JobList from "../../components/JobList";
import { Typography } from "@mui/material";
import { useQueryParams, NumberParam, StringParam } from "use-query-params";
import { useJobs } from "../../lib/paddles";


export default function Jobs() {
    const [params, setParams] = useQueryParams({
        page: NumberParam,
        pageSize: NumberParam,
        description: StringParam,
        status: StringParam,
        sha1: StringParam,
        branch: StringParam,
        user: StringParam,
        posted_after: StringParam,
        posted_before: StringParam 
    });

    const jobsQuery = useJobs(params);

    return (
        <div>
            <Typography variant="h5" style={{ margin: "20px" }}>
                Jobs
            </Typography>
            <JobList 
                query={jobsQuery} 
                params={params} 
                setter={setParams} 
                sortMode="time" 
                showColumns={["priority", "user", "description"]}
            />
        </div>
    )
}