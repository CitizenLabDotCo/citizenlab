import React, { ReactNode } from 'react';

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
  isDisabled,
  textValue,
  hasChildItems,
  onAction,
  href,
  'data-cy': dataCy,
}: RowProps) => (
  <AriaRow
    id={id}
    textValue={textValue}
    isDisabled={isDisabled}
    hasChildItems={hasChildItems}
    onAction={onAction}
    href={href}
    className={`${styles.row} ${styles[kind]}`}
    data-created={isCreated || undefined}
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

export default Row;
