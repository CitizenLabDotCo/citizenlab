import React, { ReactNode } from 'react';

import { Cell as AriaCell, Key, Row as AriaRow } from 'react-aria-components';

import '../tokens.css';

import styles from './GroupRow.module.css';

export type GroupRowProps = {
  id: Key;
  label: ReactNode;
  count?: ReactNode;
  // The number of columns, the actions slot included, so the band spans the row.
  colSpan: number;
  // The rows of the group. Keep the id in the Table's expandedKeys: a group does not collapse.
  children: ReactNode;
  textValue?: string;
};

// A parent Row announced as a row with children, not a heading; its one cell spans the row.
const GroupRow = ({
  id,
  label,
  count,
  colSpan,
  children,
  textValue,
}: GroupRowProps) => (
  <AriaRow id={id} textValue={textValue} className={styles.row}>
    <AriaCell className={styles.cell} colSpan={colSpan}>
      <div className={styles.band}>
        <span className={styles.label}>{label}</span>
        {count !== undefined && <span className={styles.count}>{count}</span>}
      </div>
    </AriaCell>
    {children}
  </AriaRow>
);

export default GroupRow;
