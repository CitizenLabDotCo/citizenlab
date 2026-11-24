import React from 'react';

import { useIntl } from 'utils/cl-intl';

import styles from './VoteProgress.module.css';
import '../tokens.css';

interface Props {
  count: number;
  maximum?: number;
}

const VoteProgress = ({ count, maximum }: Props) => {
  const { formatNumber } = useIntl();
  const percent = maximum ? Math.min(100, (count / maximum) * 100) : 0;

  return (
    <span className={styles.progress}>
      <span className={styles.count}>{formatNumber(count)}</span>
      <span className={styles.track} aria-hidden>
        <span className={styles.fill} style={{ width: `${percent}%` }} />
      </span>
    </span>
  );
};

export default VoteProgress;
