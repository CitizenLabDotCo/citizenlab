import React from 'react';

import styles from './Skeleton.module.css';
import '../tokens.css';

type Props = {
  // Line = a row of text; Block = a card, image or chart.
  shape?: 'line' | 'block';
  width?: number | string;
  height?: number | string;
  className?: string;
};

// Decorative: the region that is loading carries aria-busy.
const Skeleton = ({ shape = 'line', width, height, className }: Props) => (
  <span
    className={`${styles.skeleton} ${styles[shape]} ${className ?? ''}`}
    style={{ width, height }}
    aria-hidden
  />
);

export default Skeleton;
