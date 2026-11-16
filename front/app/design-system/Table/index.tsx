import React, { ReactNode } from 'react';

import {
  DragAndDropHooks,
  Key,
  ResizableTableContainer,
  ResizableTableContainerProps,
  Selection,
  SortDescriptor,
  Table as AriaTable,
} from 'react-aria-components';

import '../tokens.css';

import styles from './Table.module.css';

export { TableBody } from 'react-aria-components';
export { default as TableHeader } from './TableHeader';
export type { TableHeaderProps } from './TableHeader';
export { default as ColumnHeader } from './ColumnHeader';
export type { ColumnHeaderProps, ColumnIndicator } from './ColumnHeader';
export { default as ColumnResizer } from './ColumnResizer';
export { default as ColumnMenu } from './ColumnMenu';
export type { ColumnMenuProps, ColumnMenuValue } from './ColumnMenu';
export { default as Row } from './Row';
export type { RowProps, RowKind } from './Row';
export { default as Cell } from './Cell';
export type { CellProps } from './Cell';
export { default as NameCell } from './NameCell';
export type { NameCellProps } from './NameCell';
export { default as TreeToggle } from './TreeToggle';
export { default as GroupRow } from './GroupRow';
export type { GroupRowProps } from './GroupRow';
export { default as LoadMoreRow } from './LoadMoreRow';
export type { LoadMoreRowProps } from './LoadMoreRow';
export { default as CellEditor } from './CellEditor';
export type { CellEditorProps, CellEditorKind } from './CellEditor';
export { default as Toolbar } from './Toolbar';
export type { ToolbarProps } from './Toolbar';
export { default as QuickFilter } from './QuickFilter';
export type { QuickFilterProps } from './QuickFilter';
export { default as AddFilter } from './AddFilter';
export type { AddFilterProps } from './AddFilter';
export { default as ViewPill } from './ViewPill';
export type { ViewPillProps } from './ViewPill';
export { default as ViewIconButton } from './ViewIconButton';
export type { ViewIconButtonProps } from './ViewIconButton';
export { default as PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export type TableProps = {
  // TableHeader and TableBody.
  children: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: Selection;
  defaultSelectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  disabledKeys?: Iterable<Key>;
  // The id of the Name column in a nested list.
  treeColumn?: Key;
  expandedKeys?: Iterable<Key>;
  defaultExpandedKeys?: Iterable<Key>;
  onExpandedChange?: (keys: Set<Key>) => void;
  // Drives aria-sort; the column menu changes it, the column header shows it.
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
  dragAndDropHooks?: DragAndDropHooks;
  onRowAction?: (key: Key) => void;
  // Tab when cells hold editors, so Tab moves between them.
  keyboardNavigationBehavior?: 'arrow' | 'tab';
  onResize?: ResizableTableContainerProps['onResize'];
  onResizeEnd?: ResizableTableContainerProps['onResizeEnd'];
  'data-cy'?: string;
};

const Table = ({
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  disabledKeys,
  treeColumn,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  sortDescriptor,
  onSortChange,
  dragAndDropHooks,
  onRowAction,
  keyboardNavigationBehavior,
  onResize,
  onResizeEnd,
  'data-cy': dataCy,
}: TableProps) => (
  <ResizableTableContainer
    className={styles.container}
    onResize={onResize}
    onResizeEnd={onResizeEnd}
  >
    <AriaTable
      className={styles.table}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      selectionMode={selectionMode}
      selectedKeys={selectedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      onSelectionChange={onSelectionChange}
      disabledKeys={disabledKeys}
      treeColumn={treeColumn}
      expandedKeys={expandedKeys}
      defaultExpandedKeys={defaultExpandedKeys}
      onExpandedChange={onExpandedChange}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      dragAndDropHooks={dragAndDropHooks}
      onRowAction={onRowAction}
      keyboardNavigationBehavior={keyboardNavigationBehavior}
      data-cy={dataCy}
    >
      {children}
    </AriaTable>
  </ResizableTableContainer>
);

export default Table;
