import React, { useState } from 'react';

import { MenuTrigger, SortDirection } from 'react-aria-components';

import Button from '../Button';
import IconButton from '../IconButton';
import Menu, { MenuItem } from '../Menu';

import Table, {
  Cell,
  ColumnHeader,
  ColumnIndicator,
  ColumnMenu,
  Row,
  TableBody,
  TableHeader,
} from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Table',
  component: Table,
  args: { children: null, 'aria-label': 'Inputs' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const indicators: ColumnIndicator[] = ['none', 'ascending', 'descending'];

const columnMenu = (
  <ColumnMenu columnType="text" onSortChange={() => {}} onHide={() => {}} />
);

const addColumn = (
  <MenuTrigger>
    <IconButton icon="plus-16" aria-label="Add column" />
    <Menu aria-label="Columns" selectionMode="multiple">
      <MenuItem id="status">Status</MenuItem>
      <MenuItem id="likes">Likes</MenuItem>
    </Menu>
  </MenuTrigger>
);

export const ColumnHeaders: Story = {
  render: () => (
    <Table aria-label="Column headers">
      <TableHeader>
        {indicators.map((indicator, index) => (
          <ColumnHeader
            key={indicator}
            id={indicator}
            indicator={indicator}
            defaultWidth={160}
            isRowHeader={index === 0}
            menu={columnMenu}
          >
            Status
          </ColumnHeader>
        ))}
        <ColumnHeader id="nochevron" defaultWidth={160} showChevron={false}>
          Email
        </ColumnHeader>
      </TableHeader>
      <TableBody>{[]}</TableBody>
    </Table>
  ),
};

export const ColumnMenuOpen: Story = {
  render: () => (
    <div style={{ height: 200 }}>
      <MenuTrigger defaultOpen>
        <Button>Published</Button>
        <ColumnMenu
          columnType="date"
          sortDirection="ascending"
          onSortChange={() => {}}
          onHide={() => {}}
        />
      </MenuTrigger>
    </div>
  ),
};

const inputs = [
  { id: 'a', title: 'More bike lanes on Main Street', likes: 42 },
  { id: 'b', title: 'A playground in the north park', likes: 17 },
  { id: 'c', title: 'Longer library opening hours', likes: 8 },
];

// isActive: the row open in the side panel; isPicked: ticked by a caller-owned checkbox.
// Press a row to make it the active one; the column menus sort the list.
const InputTable = () => {
  const [activeId, setActiveId] = useState('b');
  const [direction, setDirection] = useState<SortDirection>('descending');
  const sorted = [...inputs].sort((a, b) =>
    direction === 'ascending' ? a.likes - b.likes : b.likes - a.likes
  );

  return (
    <div style={{ width: 800 }}>
      <Table aria-label="Inputs" keyboardNavigationBehavior="tab">
        <TableHeader addColumn={addColumn}>
          <ColumnHeader
            id="title"
            isRowHeader
            defaultWidth="1fr"
            minWidth={200}
            showChevron={false}
          >
            Input
          </ColumnHeader>
          <ColumnHeader
            id="likes"
            defaultWidth={120}
            indicator={direction}
            menu={
              <ColumnMenu
                columnType="number"
                sortDirection={direction}
                onSortChange={setDirection}
              />
            }
          >
            Likes
          </ColumnHeader>
          <ColumnHeader id="status" defaultWidth={160} showChevron={false}>
            Status
          </ColumnHeader>
        </TableHeader>
        <TableBody>
          {sorted.map((input) => (
            <Row
              key={input.id}
              id={input.id}
              textValue={input.title}
              isActive={input.id === activeId}
              isPicked={input.id === 'c'}
              onAction={() => setActiveId(input.id)}
            >
              <Cell>{input.title}</Cell>
              <Cell tone="secondary">{input.likes}</Cell>
              <Cell>Proposed</Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const FlatList: Story = {
  render: () => <InputTable />,
};
