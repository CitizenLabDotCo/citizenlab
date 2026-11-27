import React from 'react';

import styles from './EmptyState.module.css';

type Props = {
  size: 'large' | 'small';
};

// The library's empty-state illustration: an open notebook with a pencil.
const NotebookArt = ({ size }: Props) => (
  <svg
    className={`${styles.art} ${styles[`art${size}`]}`}
    viewBox="0 0 160 120"
    aria-hidden="true"
  >
    <ellipse className={styles.ground} cx="80" cy="106" rx="60" ry="5" />
    <path
      className={styles.cover}
      d="M22 26 Q22 20 28 20 L78 22 L80 24 L82 22 L132 20 Q138 20 138 26 L138 96 Q138 100 134 100 L82 100 L80 102 L78 100 L26 100 Q22 100 22 96 Z"
    />
    <path className={styles.page} d="M28 25 L77 27 L77 95 L28 95 Z" />
    <path className={styles.page} d="M83 27 L132 25 L132 95 L83 95 Z" />
    <line className={styles.spine} x1="80" y1="26" x2="80" y2="99" />
    {[42, 54, 66, 78].map((y) => (
      <React.Fragment key={y}>
        <line className={styles.rule} x1="36" y1={y} x2="70" y2={y} />
        <line className={styles.rule} x1="90" y1={y} x2="124" y2={y} />
      </React.Fragment>
    ))}
    <g className={styles.pencil} transform="translate(118 18) rotate(35)">
      <rect x="0" y="0" width="7" height="30" rx="1.5" />
      <path d="M0 30 L7 30 L3.5 38 Z" />
      <path className={styles.lead} d="M2.3 35.2 L4.7 35.2 L3.5 38 Z" />
    </g>
  </svg>
);

export default NotebookArt;
