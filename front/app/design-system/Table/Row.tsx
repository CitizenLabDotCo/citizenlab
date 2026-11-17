import React, { ReactNode, useCallback } from 'react';

import { Cell as AriaCell, Key, Row as AriaRow } from 'react-aria-components';

import '../tokens.css';

import RowGrip from './RowGrip';
import styles from './Row.module.css';

// Container = a space or folder, nested = a project inside one, flat = the flat list.
export type RowKind = 'container' | 'nested' | 'flat';

export type RowProps = {
  id: Key;
  kind?: RowKind;
  // Cell and NameCell children (NameCell with the same kind), one per column before the actions slot.
  children: ReactNode;
  // Rows nested under this one in a tree.
  childRows?: ReactNode;
  // The row menu: an IconButton Ghost 24 inside a MenuTrigger. Shows on hover.
  actions?: ReactNode;
  // The row you just made: it sits on a grey band that fades out.
  isCreated?: boolean;
  // The row shown as current without being picked, such as the one open in the side panel.
  // Drawn like a selected row and marked aria-current.
  isActive?: boolean;
  // Ticked by a checkbox the caller owns (no React Aria selection): drawn as Selected=Yes.
  isPicked?: boolean;
  isDisabled?: boolean;
  textValue?: string;
  hasChildItems?: boolean;
  onAction?: () => void;
  href?: string;
  'data-cy'?: string;
};

const Row = ({
  id,
  kind = 'nested',
  children,
  childRows,
  actions,
  isCreated = false,
  isActive = false,
  isPicked = false,
  isDisabled,
  textValue,
  hasChildItems,
  onAction,
  href,
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
      isDisabled={isDisabled}
      hasChildItems={hasChildItems}
      onAction={onAction}
      href={href}
      className={`${styles.row} ${styles[kind]}`}
      data-created={isCreated || undefined}
      data-active={isActive || undefined}
      data-picked={isPicked || undefined}
      data-cy={dataCy}
    >
      {children}
      <AriaCell className={styles.actionsCell}>
        <div className={styles.actions}>{actions}</div>
        <RowGrip />
      </AriaCell>
      {childRows}
    </AriaRow>
  );
};

export default Row;
