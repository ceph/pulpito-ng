import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';


export default function ErrorPage() {
    return (
        <div>
            <Typography variant="overline" display="block" gutterBottom>
                <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                404 
                <Divider orientation="vertical" variant="middle" flexItem />
                This page could not be found.
                </div>
            </Typography>
        </div>
    )
}