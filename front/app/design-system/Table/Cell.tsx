import React, { ReactNode } from 'react';

import { Cell as AriaCell } from 'react-aria-components';

import styles from './Cell.module.css';
import '../tokens.css';

type CellProps = {
  children?: ReactNode;
  tone?: 'cell' | 'secondary';
};

const Cell = ({ children, tone = 'cell' }: CellProps) => (
  <AriaCell className={styles.cell}>
    <div
      className={`${styles.content} ${
        tone === 'secondary' ? styles.secondary : styles.toneCell
      }`}
    >
      {children}
    </div>
  </AriaCell>
);

export default Cell;
