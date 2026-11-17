import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';

import Icon from '../Icon';
import '../tokens.css';

import messages from './messages';
import styles from './ReviewStatus.module.css';

type Props = {
  status: 'toReview' | 'toSet' | 'reviewed';
};

const ReviewStatus = ({ status }: Props) => {
  const isReviewed = status === 'reviewed';

  return (
    <span className={`${styles.reviewStatus} ${styles[status]}`}>
      <Icon
        name={isReviewed ? 'circle-check-filled-16' : 'circle-dashed-14'}
        className={styles.icon}
      />
      <span>
        <FormattedMessage {...messages[status]} />
      </span>
    </span>
  );
};

export default ReviewStatus;
