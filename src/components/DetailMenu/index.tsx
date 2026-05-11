import { Menu, Button, Text } from '@mantine/core';
import { type Table } from '@tanstack/react-table';

import type { RowDetail } from "../../lib/types.d";

function ExpandAllButton<TData>({table}: {table: Table<TData>}) {
  return (
    <div>
      <button
        className='expandButton'
        onClick={table.getToggleAllRowsExpandedHandler()}
      >
        {table.getIsAllRowsExpanded() ? '-' : '+'}
      </button>
    </div>
  )
}

type DetailMenuProps<TData> = {
  table: Table<TData>;
  details: RowDetail[];
  setDetails: React.Dispatch<React.SetStateAction<RowDetail[]>>,
}

export default function DetailMenu<TData>(props: DetailMenuProps<TData>) {
  const itemClicked = (e: any) => {
  }
  return (
    <>
    <ExpandAllButton table={props.table}/>
    <Menu>
      <Menu.Target>
        <Button
          >
          D
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        { props.details.map((detail) => (
          <Menu.Item key={detail.key} onClick={() => {}}>
            { detail.display? "x " + detail.key : detail.key }
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
    </>
  )
}
