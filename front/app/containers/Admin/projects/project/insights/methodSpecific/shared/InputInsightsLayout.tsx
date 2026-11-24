import React, { ReactNode } from 'react';

import styles from './InputInsightsLayout.module.css';

type Props = {
  summary: ReactNode;
  topics: ReactNode;
  statuses: ReactNode;
  mostLiked: ReactNode;
};

// The dashboard cards of a method that collects inputs (ideation, proposals).
const InputInsightsLayout = ({
  summary,
  topics,
  statuses,
  mostLiked,
}: Props) => (
  <div className={styles.layout}>
    <div className={styles.pair}>
      <div className={styles.summary}>{summary}</div>
      <div className={styles.topics}>{topics}</div>
    </div>
    {statuses}
    {mostLiked}
  </div>
);

export default InputInsightsLayout;
