import React, { useState } from 'react';

import {
  Key,
  ListBox,
  ListBoxItem,
  MenuTrigger,
  Popover,
  Select,
  SelectValue,
  useDragAndDrop,
} from 'react-aria-components';

import Avatar from '../Avatar';
import AvatarStack from '../Avatar/AvatarStack';
import Button from '../Button';
import IconButton from '../IconButton';
import Menu, { MenuItem } from '../Menu';
import SearchField from '../SearchField';
import SplitButton from '../SplitButton';
import StatusWord from '../StatusWord';

import Table, {
  AddFilter,
  Cell,
  CellEditor,
  ColumnHeader,
  ColumnIndicator,
  ColumnMenu,
  GroupRow,
  LoadMoreRow,
  NameCell,
  PageHeader,
  QuickFilter,
  Row,
  TableBody,
  TableHeader,
  Toolbar,
  ViewIconButton,
  ViewPill,
} from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Table',
  component: Table,
  args: { children: null, 'aria-label': 'Projects' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const indicators: ColumnIndicator[] = [
  'none',
  'ascending',
  'descending',
  'filtered',
];

const statusValues = [
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'archived', label: 'Archived' },
  { id: 'pending', label: 'Pending approval' },
];

const columnMenu = (
  <ColumnMenu values={statusValues} filterPlaceholder="Filter status" />
);

const addColumn = (
  <MenuTrigger>
    <IconButton icon="plus-16" aria-label="Add column" />
    <Menu aria-label="Columns" selectionMode="multiple">
      <MenuItem id="status">Status</MenuItem>
      <MenuItem id="phase">Phase</MenuItem>
    </Menu>
  </MenuTrigger>
);

const rowMenu = (
  <MenuTrigger>
    <IconButton icon="more-horizontal-16" size={24} aria-label="More" />
    <Menu aria-label="Row actions">
      <MenuItem>Edit</MenuItem>
      <MenuItem>Duplicate</MenuItem>
    </Menu>
  </MenuTrigger>
);

export const ColumnHeaders: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {([36, 32] as const).map((size) => (
        <Table key={size} aria-label={`Column headers ${size}`}>
          <TableHeader>
            {indicators.map((indicator, index) => (
              <ColumnHeader
                key={indicator}
                id={indicator}
                size={size}
                indicator={indicator}
                defaultWidth={160}
                isRowHeader={index === 0}
                menu={columnMenu}
              >
                Status
              </ColumnHeader>
            ))}
            <ColumnHeader
              id="expand"
              size={size}
              defaultWidth={160}
              hasExpandAll
              isAllExpanded={false}
              onExpandAll={() => {}}
              menu={columnMenu}
            >
              Name
            </ColumnHeader>
            <ColumnHeader
              id="collapse"
              size={size}
              defaultWidth={160}
              hasExpandAll
              isAllExpanded
              onExpandAll={() => {}}
              menu={columnMenu}
            >
              Name
            </ColumnHeader>
            <ColumnHeader
              id="number"
              size={size}
              defaultWidth={160}
              align="end"
              menu={columnMenu}
            >
              Participants
            </ColumnHeader>
            <ColumnHeader
              id="nochevron"
              size={size}
              defaultWidth={160}
              showChevron={false}
            >
              Status
            </ColumnHeader>
          </TableHeader>
          <TableBody>{[]}</TableBody>
        </Table>
      ))}
    </div>
  ),
};

export const ColumnMenuOpen: Story = {
  render: () => (
    <div style={{ height: 360 }}>
      <MenuTrigger defaultOpen>
        <Button>Status</Button>
        <ColumnMenu
          sortDirection="ascending"
          values={statusValues}
          filterPlaceholder="Filter status"
        />
      </MenuTrigger>
    </div>
  ),
};

const ProjectHeader = ({ nested }: { nested: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <TableHeader addColumn={addColumn}>
      {nested ? (
        <ColumnHeader
          id="name"
          isRowHeader
          menu={columnMenu}
          hasExpandAll
          isAllExpanded={expanded}
          onExpandAll={() => setExpanded(!expanded)}
        >
          Name
        </ColumnHeader>
      ) : (
        <ColumnHeader id="name" isRowHeader menu={columnMenu}>
          Name
        </ColumnHeader>
      )}
      <ColumnHeader id="status" defaultWidth={136} menu={columnMenu}>
        Status
      </ColumnHeader>
      <ColumnHeader id="phase" defaultWidth={224} menu={columnMenu}>
        Phase
      </ColumnHeader>
      <ColumnHeader id="managers" defaultWidth={184} menu={columnMenu}>
        Managers
      </ColumnHeader>
      <ColumnHeader
        id="participants"
        defaultWidth={128}
        align="end"
        menu={columnMenu}
      >
        Participants
      </ColumnHeader>
      <ColumnHeader id="start" defaultWidth={112} menu={columnMenu}>
        Start
      </ColumnHeader>
      <ColumnHeader id="end" defaultWidth={112} menu={columnMenu}>
        End
      </ColumnHeader>
    </TableHeader>
  );
};

const StatusEditor = () => (
  <Select aria-label="Status" defaultSelectedKey="published">
    <CellEditor kind="status">
      <SelectValue>
        {({ selectedText }) => <StatusWord>{selectedText}</StatusWord>}
      </SelectValue>
    </CellEditor>
    <Popover>
      <ListBox>
        <ListBoxItem id="published">Published</ListBoxItem>
        <ListBoxItem id="draft">Draft</ListBoxItem>
      </ListBox>
    </Popover>
  </Select>
);

const ManagerEditor = ({
  name,
  initials,
}: {
  name: string;
  initials: string;
}) => (
  <CellEditor kind="manager" avatar={<Avatar size={24} initials={initials} />}>
    {name}
  </CellEditor>
);

const ProjectCells = () => (
  <>
    <Cell hasEditor>
      <StatusEditor />
    </Cell>
    <Cell meta="2 weeks left">Voting</Cell>
    <Cell hasEditor>
      <ManagerEditor name="Tom Bekker" initials="TB" />
    </Cell>
    <Cell align="end">133</Cell>
    <Cell tone="secondary">11 Sep 2026</Cell>
    <Cell tone="secondary">22 Jan 2027</Cell>
  </>
);

const ContainerCells = () => (
  <>
    <Cell hasEditor>
      <ManagerEditor name="Aisha Karimi" initials="AK" />
    </Cell>
    <Cell />
    <Cell />
    <Cell />
  </>
);

const projectName = 'Parking permits for residents and visitors in Old Town';

export const NestedList: Story = {
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(
      new Set(['group', 'space', 'folder'])
    );
    const { dragAndDropHooks } = useDragAndDrop({
      getItems: (keys) => [...keys].map((key) => ({ 'text/plain': `${key}` })),
      onReorder: () => {},
    });

    return (
      <div style={{ width: 1360 }}>
        <Table
          aria-label="Projects"
          treeColumn="name"
          expandedKeys={expandedKeys}
          onExpandedChange={setExpandedKeys}
          dragAndDropHooks={dragAndDropHooks}
          keyboardNavigationBehavior="tab"
          disabledKeys={['disabled']}
        >
          <ProjectHeader nested />
          <TableBody>
            <GroupRow
              id="group"
              label="Other projects you manage"
              count={2}
              colSpan={8}
              textValue="Other projects you manage"
            >
              <Row
                id="space"
                kind="container"
                actions={rowMenu}
                hasChildItems
                textValue="Mobility and transport"
                childRows={
                  <>
                    <Row
                      id="folder"
                      kind="container"
                      actions={rowMenu}
                      hasChildItems
                      textValue="Parking permits"
                      childRows={
                        <Row id="p1" actions={rowMenu} textValue={projectName}>
                          <NameCell kind="nested">{projectName}</NameCell>
                          <ProjectCells />
                        </Row>
                      }
                    >
                      <NameCell
                        kind="container"
                        typeIcon="folder-16"
                        meta="4 projects"
                        colSpan={3}
                      >
                        Parking permits
                      </NameCell>
                      <ContainerCells />
                    </Row>
                    <Row id="p2" actions={rowMenu} textValue={projectName}>
                      <NameCell kind="nested">{projectName}</NameCell>
                      <ProjectCells />
                    </Row>
                    <Row
                      id="disabled"
                      actions={rowMenu}
                      textValue={projectName}
                    >
                      <NameCell kind="nested">Disabled project</NameCell>
                      <ProjectCells />
                    </Row>
                  </>
                }
              >
                <NameCell
                  kind="container"
                  meta="6 folders · 22 projects"
                  colSpan={3}
                >
                  Mobility and transport
                </NameCell>
                <ContainerCells />
              </Row>
            </GroupRow>
            <Row id="created" isCreated actions={rowMenu} textValue="New space">
              <NameCell kind="nested">New project</NameCell>
              <ProjectCells />
            </Row>
            <Row id="hit" kind="container" textValue="Search hit">
              <NameCell
                kind="container"
                typeIcon="folder-16"
                meta="6 projects ·"
                spacePath="Climate and environment"
                showToggle={false}
                colSpan={3}
              >
                Search hit folder
              </NameCell>
              <ContainerCells />
            </Row>
            <LoadMoreRow isLoading showSpinner>
              Loading more projects
            </LoadMoreRow>
          </TableBody>
        </Table>
      </div>
    );
  },
};

export const FlatList: Story = {
  render: () => (
    <div style={{ width: 1360 }}>
      <Table
        aria-label="Projects"
        selectionMode="multiple"
        defaultSelectedKeys={new Set(['b', 'c'])}
        keyboardNavigationBehavior="tab"
      >
        <ProjectHeader nested={false} />
        <TableBody>
          {['a', 'b', 'c', 'd'].map((id) => (
            <Row
              key={id}
              id={id}
              kind="flat"
              actions={rowMenu}
              textValue={projectName}
            >
              <NameCell
                kind="flat"
                path={{
                  space: 'Mobility and transport',
                  folder: 'Parking permits',
                }}
              >
                {projectName}
              </NameCell>
              <ProjectCells />
            </Row>
          ))}
          <LoadMoreRow isLoading>Loading more projects</LoadMoreRow>
        </TableBody>
      </Table>
    </div>
  ),
};

// isActive: the row open in the side panel, drawn as Selected=Yes without React Aria selection.
// Press a row to make it the active one.
const ActiveRows = () => {
  const [activeId, setActiveId] = useState('b');

  return (
    <div style={{ width: 1360 }}>
      <Table aria-label="Projects" keyboardNavigationBehavior="tab">
        <ProjectHeader nested={false} />
        <TableBody>
          {['a', 'b', 'c'].map((id) => (
            <Row
              key={id}
              id={id}
              kind="flat"
              isActive={id === activeId}
              onAction={() => setActiveId(id)}
              actions={rowMenu}
              textValue={projectName}
            >
              <NameCell
                kind="flat"
                path={{
                  space: 'Mobility and transport',
                  folder: 'Parking permits',
                }}
              >
                {projectName}
              </NameCell>
              <ProjectCells />
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const ActiveRow: Story = {
  render: () => <ActiveRows />,
};

export const CellEditors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <StatusEditor />
      <CellEditor kind="status" showChevron>
        <StatusWord>Published</StatusWord>
      </CellEditor>
      <ManagerEditor name="Tom Bekker" initials="TB" />
      <CellEditor
        kind="managers"
        showChevron
        avatar={
          <AvatarStack avatars={[{ initials: 'TB' }, { initials: 'AK' }]} />
        }
      >
        2 managers
      </CellEditor>
    </div>
  ),
};

const filters = (selected: boolean) => (
  <>
    <QuickFilter
      label="Pending approval"
      count={3}
      defaultSelected={selected}
    />
    <MenuTrigger>
      <AddFilter />
      <Menu aria-label="Filters">
        <MenuItem>Status</MenuItem>
        <MenuItem>Phase</MenuItem>
      </Menu>
    </MenuTrigger>
  </>
);

const display = (searchOpen: boolean) => (
  <>
    <MenuTrigger>
      <ViewPill icon="filter-lines-14">Recently viewed</ViewPill>
      <Menu aria-label="Sort" selectionMode="single">
        <MenuItem id="recent">Recently viewed</MenuItem>
        <MenuItem id="name">Name</MenuItem>
      </Menu>
    </MenuTrigger>
    <MenuTrigger>
      <ViewPill icon="list-14">List</ViewPill>
      <Menu aria-label="View" selectionMode="single">
        <MenuItem id="list">List</MenuItem>
        <MenuItem id="nested">Nested</MenuItem>
      </Menu>
    </MenuTrigger>
    <ViewIconButton icon="grip-vertical-16" aria-label="Arrange projects" />
    {searchOpen ? (
      <SearchField
        aria-label="Search projects"
        placeholder="Search projects, folders and spaces"
        defaultValue="Climate"
      />
    ) : (
      <ViewIconButton icon="search-16" aria-label="Search projects" />
    )}
  </>
);

export const Toolbars: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, width: 1360 }}>
      <Toolbar
        aria-label="List tools"
        filters={filters(false)}
        display={display(false)}
      />
      <Toolbar
        aria-label="List tools"
        filters={filters(true)}
        display={display(true)}
      />
    </div>
  ),
};

export const ToolbarParts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <QuickFilter label="Pending approval" count={3} />
        <QuickFilter label="Pending approval" count={3} defaultSelected />
      </div>
      <AddFilter />
      <div style={{ display: 'flex', gap: 16 }}>
        <ViewPill icon="filter-lines-14">Recently viewed</ViewPill>
        <ViewPill icon="filter-lines-14" isSelected>
          Recently viewed
        </ViewPill>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <ViewIconButton icon="grip-vertical-16" aria-label="Arrange projects" />
        <ViewIconButton icon="search-16" aria-label="Search projects" />
      </div>
    </div>
  ),
};

export const PageHeaders: Story = {
  render: () => (
    <div style={{ width: 1360 }}>
      <PageHeader
        title="Projects"
        platformMenu={<IconButton icon="panel-left-16" aria-label="Menu" />}
        actions={
          <SplitButton
            variant="primary"
            menu={
              <Menu aria-label="New" placement="bottom end">
                <MenuItem>New space</MenuItem>
                <MenuItem>New folder</MenuItem>
              </Menu>
            }
          >
            New project
          </SplitButton>
        }
      />
    </div>
  ),
};
