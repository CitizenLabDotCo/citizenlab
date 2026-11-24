import React from 'react';

import styles from './ColorDot.module.css';

interface Props {
  color: string;
}

// Idea status colours are set per platform, so the colour comes from the data.
const ColorDot = ({ color }: Props) => (
  <span className={styles.dot} style={{ background: color }} aria-hidden />
);

export default ColorDot;
