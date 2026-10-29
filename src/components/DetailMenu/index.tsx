import { Menu, Button, Text } from '@mantine/core';
import { type Table } from '@tanstack/react-table';
import {
  IconAdjustments,
  IconChevronDown,
  IconChevronUp,
  IconSquare,
  IconSquareCheck,
} from '@tabler/icons-react';

import type { RowDetail } from "../../lib/types.d";

function ExpandAllButton<TData>({table}: {table: Table<TData>}) {
  return (
      <Button
        className='expandButton'
        onClick={table.getToggleAllRowsExpandedHandler()}
      >
        {table.getIsAllRowsExpanded() ? <IconChevronUp /> : <IconChevronDown />}
      </Button>
  )
}

type DetailMenuProps<TData> = {
  table: Table<TData>;
  details: RowDetail;
  setDetails: React.Dispatch<React.SetStateAction<RowDetail>>,
}

export default function DetailMenu<TData>(props: DetailMenuProps<TData>) {
  const details = props.details;
  return (
    <>
    <ExpandAllButton table={props.table}/>
    <Menu>
      <Menu.Target>
        <Button
          >
          <IconAdjustments />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Detail row content</Menu.Label>
        { Object.entries(props.details).map(([key, display]) => (
          <Menu.Item
            key={key}
            onClick={() => props.setDetails({...details, [key]: !display})}
            leftSection={display? <IconSquareCheck /> : <IconSquare />}
          >
            { key }
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
    </>
  )
}
