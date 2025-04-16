

type FilterMenuProps = {
  isOpen: boolean; 
  table: MRT_TableInstance<Job>;
};


function FilterMenu({ isOpen, table}: FilterMenuProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        padding: '1em',
        margin: '0px 0.5em',
        border: '2px dashed grey',
        borderRadius: '8px',
      }}
    >
      {FILTER_SECTIONS_COLUMNS.map((_, sectionIndex) => (
        <Box
          key={`section-${sectionIndex}`}
          sx={{
            marginBottom: '1em',
            marginLeft: '0.5em',
          }}
        >
          <Typography variant="body2" gutterBottom color="gray">
            Filter by {FILTER_SECTIONS[sectionIndex]} details...
          </Typography>
          <Grid container spacing={1} alignItems="center">
            {table.getLeafHeaders().map((header) => {
              if (FILTER_SECTIONS_COLUMNS[sectionIndex].includes(header.id)) {
                return (
                  <Grid item xs={2} key={header.id}  marginLeft={"1.2em"}>
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

