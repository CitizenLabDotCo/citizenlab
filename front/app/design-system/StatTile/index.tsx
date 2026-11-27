import React, { ReactNode } from 'react';

import { Focusable } from 'react-aria-components';

import Tooltip from '../Tooltip';

import styles from './StatTile.module.css';
import '../tokens.css';

type StatTileProps = {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  // What the figure counts. The whole tile opens it, on hover and on focus.
  tooltip?: ReactNode;
};

const StatTile = ({ label, value, className, tooltip }: StatTileProps) => {
  const tile = (
    <div
      className={`${styles.tile} ${tooltip ? styles.hinted : ''} ${
        className ?? ''
      }`}
      tabIndex={tooltip ? 0 : undefined}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );

  if (!tooltip) return tile;

  return (
    <Tooltip content={tooltip}>
      <Focusable>{tile}</Focusable>
    </Tooltip>
  );
};

export default StatTile;
