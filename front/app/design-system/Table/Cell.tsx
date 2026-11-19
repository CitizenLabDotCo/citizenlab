import React, { ReactNode } from 'react';

import { Cell as AriaCell } from 'react-aria-components';

import styles from './Cell.module.css';
import '../tokens.css';

type CellProps = {
  children?: ReactNode;
  tone?: 'cell' | 'secondary';
  // End: numbers, lined up on their right edge.
  align?: 'start' | 'end';
};

const Cell = ({ children, tone = 'cell', align = 'start' }: CellProps) => (
  <AriaCell className={styles.cell}>
    <div
      className={`${styles.content} ${
        tone === 'secondary' ? styles.secondary : styles.toneCell
      } ${align === 'end' ? styles.end : ''}`}
    >
      {children}
    </div>
  </AriaCell>
);

export default Cell;
