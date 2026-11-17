import React, { ReactNode, useCallback } from 'react';

import { Cell as AriaCell, Key, Row as AriaRow } from 'react-aria-components';

import '../tokens.css';

import styles from './Row.module.css';

type RowProps = {
  id: Key;
  // Cell children, one per column before the actions slot.
  children: ReactNode;
  // The row shown as current without being picked, such as the one open in the side panel.
  // Drawn like a picked row and marked aria-current.
  isActive?: boolean;
  // Ticked by a checkbox the caller owns (no React Aria selection): drawn as Selected=Yes.
  isPicked?: boolean;
  textValue?: string;
  onAction?: () => void;
  'data-cy'?: string;
};

const Row = ({
  id,
  children,
  isActive = false,
  isPicked = false,
  textValue,
  onAction,
  'data-cy': dataCy,
}: RowProps) => {
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
      data-picked={isPicked || undefined}
      data-cy={dataCy}
    >
      {children}
      {/* Fills the header's last column, which holds the add-column menu. */}
      <AriaCell className={styles.actionsCell} />
    </AriaRow>
  );
};

export default Row;
