import React, { ReactNode, useState } from 'react';

import {
  Key,
  ResizableTableContainer,
  Selection,
  Table as AriaTable,
} from 'react-aria-components';

import SelectionLabelsContext, {
  SelectionLabels,
} from './SelectionLabelsContext';
import styles from './Table.module.css';
import '../tokens.css';

export { TableBody } from 'react-aria-components';
export type { Selection } from 'react-aria-components';
export { default as TableHeader } from './TableHeader';
export { default as ColumnHeader } from './ColumnHeader';
export { default as ColumnMenu } from './ColumnMenu';
export { default as Row } from './Row';
export { default as Cell } from './Cell';

type TableSelection = SelectionLabels & {
  // Keys of this page's rows only: React Aria counts any key towards select-all.
  selectedKeys: Iterable<Key>;
  // 'all' means every row on the page.
  onSelectionChange: (keys: Selection) => void;
};

type TableProps = {
  // TableHeader and TableBody.
  children: ReactNode;
  'aria-label': string;
  // Tab when cells hold editors, so Tab moves between them.
  keyboardNavigationBehavior?: 'tab';
  // Adds a checkbox column. The labels are the app's, because React Aria
  // translates its own into fewer languages.
  selection?: TableSelection;
};

const hasSameKeys = (selection: Selection, keys: Set<Key>) =>
  selection !== 'all' &&
  selection.size === keys.size &&
  [...keys].every((key) => selection.has(key));

// The container is what makes React Aria apply the column widths.
const Table = ({
  children,
  'aria-label': ariaLabel,
  keyboardNavigationBehavior,
  selection,
}: TableProps) => {
  const [reported, setReported] = useState<Selection | null>(null);
  const keys = new Set(selection?.selectedKeys);
  // Shift-click ranges start from an anchor that React Aria keeps on the
  // selection it reported, so hand that one back while the keys still match.
  const selectedKeys =
    reported && hasSameKeys(reported, keys) ? reported : keys;

  return (
    <ResizableTableContainer className={styles.container}>
      <SelectionLabelsContext.Provider
        value={
          selection
            ? { selectAll: selection.selectAll, selectRow: selection.selectRow }
            : null
        }
      >
        <AriaTable
          className={styles.table}
          aria-label={ariaLabel}
          keyboardNavigationBehavior={keyboardNavigationBehavior}
          selectionMode={selection ? 'multiple' : undefined}
          selectionBehavior="toggle"
          selectedKeys={selection ? selectedKeys : undefined}
          onSelectionChange={(next) => {
            setReported(next);
            selection?.onSelectionChange(next);
          }}
        >
          {children}
        </AriaTable>
      </SelectionLabelsContext.Provider>
    </ResizableTableContainer>
  );
};

export default Table;
