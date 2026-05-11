import { Menu, Button, Text } from '@mantine/core';
import { type Table } from '@tanstack/react-table';
import CheckBox from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Tune from "@mui/icons-material/Tune";

import type { RowDetail } from "../../lib/types.d";

function ExpandAllButton<TData>({table}: {table: Table<TData>}) {
  return (
      <Button
        className='expandButton'
        onClick={table.getToggleAllRowsExpandedHandler()}
      >
        {table.getIsAllRowsExpanded() ? <ExpandLess /> : <ExpandMore />}
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
          <Tune />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Detail row content</Menu.Label>
        { Object.entries(props.details).map(([key, display]) => (
          <Menu.Item
            key={key}
            onClick={() => {details[key] = !display; props.setDetails({...details})}}
            leftSection={display? <CheckBox /> : <CheckBoxOutlineBlank />}
          >
            { key }
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
    </>
  )
}
