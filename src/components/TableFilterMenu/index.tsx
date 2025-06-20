import Grid from '@mui/material/Grid';
import {
  MRT_TableHeadCellFilterContainer,
  type MRT_TableInstance,
} from 'material-react-table';

import type {
  Run,
  Job,
} from "../../lib/paddles";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';


type FilterMenuProps = {
  isOpen: boolean; 
  table: MRT_TableInstance<Job|Run>;
  filterSections: { [key: string]: string[] }; 
};


export default function TableFilterMenu({ isOpen, table, filterSections }: FilterMenuProps) {
  if (!isOpen) {
    return null;
  }
  console.log(table.getLeafHeaders());
  console.log(table)
  return (
    <Box
      sx={{
        padding: '1em',
        margin: '0px 0.5em',
        border: '2px dashed grey',
        borderRadius: '8px',
      }}
    >
      {Object.keys(filterSections).map((sectionName, sectionIndex) => (
        <Box
          key={`section-${sectionIndex}`}
          sx={{
            marginBottom: '1em',
            marginLeft: '0.5em',
          }}
        >
          <Typography variant="body2" gutterBottom color="gray">
            Filter by {sectionName} details...
          </Typography>
          <Grid container spacing={1} alignItems="center">
            {table.getFlatHeaders().map((header) => {   
              if (filterSections[sectionName].includes(header.id)) {
                return (
                  <Grid item sx={{width: 160}} key={header.id}  margin={".5em"}>
                    <MRT_TableHeadCellFilterContainer
                      header={header}
                      table={table}
                      style={{ backgroundColor: 'transparent', width: '100%' }}
                    />
                  </Grid>
                );
              }
              return null;
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  ) 
}

