import { Box, Grid } from '@mantine/core';

import {
  type Table,
} from '@tanstack/react-table';
import { Button, Popover } from '@mantine/core';

import Filter from "#src/components/Filter";
import {type FilterMenuSections, type FilterMenuFilters} from '#src/lib/types.d';

import './index.css';


type FilterMenuProps<TData> = {
  isOpen: boolean;
  onChange: (opened: boolean) => void;
  table: Table<TData>;
  sections: FilterMenuSections;
};

export default function FilterMenu<TData>({ isOpen, onChange, table, sections }: FilterMenuProps<TData>) {
  return (
    <Popover
      opened={isOpen}
      onChange={onChange}
    >
      <Popover.Target>
        <Button
          onClick={() => onChange(!isOpen)}
          className='filterbutton'
          style={{display: 'flex'}}
        >
          Filter
        </Button>
      </Popover.Target>
    <Popover.Dropdown>
      <Box className='filtermenu'>
        {Object.entries(sections).map(([sectionName, section]) => (
          <Box
            className='filtermenu-section'
            key={`section-${sectionName}`}
          >
            { section.label? (
            <div>
              {section.label}
            </div>
            ) : null}
            <Grid
              type='container'
              gutter={1}
              align='center'
            >
              {table.getAllLeafColumns().map((column) => {
                if (Object.keys(section.filters).includes(column.id)) {
                  const filter = section.filters[column.id as keyof FilterMenuFilters];
                  return (
                    <Filter
                      options={filter.options}
                      value={column.getFilterValue() as string}
                      placeholder={column.id}
                      id={column.id}
                      type={filter.type}
                      component={filter.component}
                      label={filter.label}
                      key={"filter-" + column.id}
                      size={filter.size}
                    />
                  )
                }
                return null;
              })}
            </Grid>
          </Box>
        ))}
      </Box>
    </Popover.Dropdown>
    </Popover>
  );
}
