import React, { ReactNode } from 'react';

import styles from './StatTile.module.css';
import '../tokens.css';

type StatTileProps = {
  label: ReactNode;
  value: ReactNode;
  className?: string;
};

const StatTile = ({ label, value, className }: StatTileProps) => (
  <div className={`${styles.tile} ${className ?? ''}`}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{value}</span>
  </div>
);

export default StatTile;
