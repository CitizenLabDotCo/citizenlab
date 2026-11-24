import React, { ReactNode } from 'react';

import { Label, Meter } from 'react-aria-components';

import styles from './BarRow.module.css';
import '../tokens.css';

type Props = {
  label: ReactNode;
  // What the bar stands for, for example "18% · 6".
  value: string;
  // Between 0 and 1.
  share: number;
  // A chart colour. Defaults to the primary series colour.
  color?: string;
};

const BarRow = ({ label, value, share, color }: Props) => {
  const percent = Math.min(Math.max(share, 0), 1) * 100;

  return (
    <Meter className={styles.row} value={percent} valueLabel={value}>
      <Label className={styles.label}>{label}</Label>
      <span className={styles.track}>
        <span
          className={styles.fill}
          style={{ width: `${percent}%`, background: color }}
        />
      </span>
      <span className={styles.value}>{value}</span>
    </Meter>
  );
};

export default BarRow;
