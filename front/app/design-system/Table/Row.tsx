import React, { ReactNode, useCallback, useContext } from 'react';

import { Cell as AriaCell, Key, Row as AriaRow } from 'react-aria-components';

import Checkbox from '../Checkbox';

import Cell from './Cell';
import styles from './Row.module.css';
import SelectionLabelsContext from './SelectionLabelsContext';
import '../tokens.css';

type RowProps = {
  id: Key;
  // Cell children, one per column between the selection and actions slots.
  children: ReactNode;
  // The row shown as current without being picked, such as the one open in the side panel.
  // Drawn like a selected row and marked aria-current.
  isActive?: boolean;
  textValue?: string;
  onAction?: () => void;
  'data-cy'?: string;
};

const Row = ({
  id,
  children,
  isActive = false,
  textValue,
  onAction,
  'data-cy': dataCy,
}: RowProps) => {
  const selectionLabels = useContext(SelectionLabelsContext);

  // React Aria's Row does not pass aria-current through, so set it on the element.
  // A callback ref, because the row element mounts after the collection is built.
  const ref = useCallback(
    (row: HTMLTableRowElement | null) => {
      if (!row) return;
      if (isActive) {
        row.setAttribute('aria-current', 'true');
      } else {
        row.removeAttribute('aria-current');
      }
    },
    [isActive]
  );

  return (
    <AriaRow
      ref={ref}
      id={id}
      textValue={textValue}
      onAction={onAction}
      className={styles.row}
      data-active={isActive || undefined}
      data-cy={dataCy}
    >
      {selectionLabels && (
        <Cell>
          <Checkbox slot="selection" aria-label={selectionLabels.selectRow} />
        </Cell>
      )}
      {children}
      {/* Fills the header's last column, which holds the add-column menu. */}
      <AriaCell className={styles.actionsCell} />
    </AriaRow>
  );
};

export default Row;
