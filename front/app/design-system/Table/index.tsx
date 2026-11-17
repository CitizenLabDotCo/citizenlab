import React, { ReactNode } from 'react';

import {
  ResizableTableContainer,
  Table as AriaTable,
} from 'react-aria-components';

import styles from './Table.module.css';
import '../tokens.css';

export { TableBody } from 'react-aria-components';
export { default as TableHeader } from './TableHeader';
export { default as ColumnHeader } from './ColumnHeader';
export type { ColumnIndicator } from './ColumnHeader';
export { default as ColumnMenu } from './ColumnMenu';
export { default as Row } from './Row';
export { default as Cell } from './Cell';

type TableProps = {
  // TableHeader and TableBody.
  children: ReactNode;
  'aria-label': string;
  // Tab when cells hold editors, so Tab moves between them.
  keyboardNavigationBehavior?: 'tab';
};

// The container is what makes React Aria apply the column widths.
const Table = ({
  children,
  'aria-label': ariaLabel,
  keyboardNavigationBehavior,
}: TableProps) => (
  <ResizableTableContainer className={styles.container}>
    <AriaTable
      className={styles.table}
      aria-label={ariaLabel}
      keyboardNavigationBehavior={keyboardNavigationBehavior}
    >
      {children}
    </AriaTable>
  </ResizableTableContainer>
);

export default Table;
