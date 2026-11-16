import React, { ReactNode } from 'react';

import { Cell as AriaCell } from 'react-aria-components';

import '../tokens.css';

import styles from './Cell.module.css';

export type CellProps = {
  children?: ReactNode;
  // Secondary words after the value, such as the time left of a phase.
  meta?: ReactNode;
  tone?: 'cell' | 'secondary';
  // Numbers end-align.
  align?: 'start' | 'end';
  // A cell that holds a CellEditor starts 6 px in, so the editor's text lines up with the column.
  hasEditor?: boolean;
  colSpan?: number;
  textValue?: string;
};

const Cell = ({
  children,
  meta,
  tone = 'cell',
  align = 'start',
  hasEditor = false,
  colSpan,
  textValue,
}: CellProps) => (
  <AriaCell className={styles.cell} colSpan={colSpan} textValue={textValue}>
    <div
      className={`${styles.content} ${
        tone === 'secondary' ? styles.secondary : styles.toneCell
      } ${hasEditor ? styles.editor : ''}`}
      data-align={align}
    >
      {children}
      {meta && <span className={styles.meta}>{meta}</span>}
    </div>
  </AriaCell>
);

export default Cell;
