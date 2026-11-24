import React from 'react';

import styles from './PreviewDateBlock.module.css';
import 'design-system/tokens.css';

interface Props {
  day: string;
  month: string;
  time: string;
}

const PreviewDateBlock = ({ day, month, time }: Props) => (
  <div className={styles.block}>
    <p className={styles.day}>{day}</p>
    <p className={styles.month}>{month}</p>
    <p className={styles.time}>{time}</p>
  </div>
);

export default PreviewDateBlock;
