import React, { ReactNode } from 'react';

import '../tokens.css';

import styles from './StatTile.module.css';

type TypeProps =
  | { type?: 'default' | 'tall'; note?: undefined }
  | { type: 'withNote'; note: ReactNode };

export type StatTileProps = TypeProps & {
  label: ReactNode;
  value: ReactNode;
};

const StatTile = ({ label, value, type = 'default', note }: StatTileProps) => (
  <div className={`${styles.tile} ${styles[type]}`}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{value}</span>
    {note && <span className={styles.note}>{note}</span>}
  </div>
);

export default StatTile;
