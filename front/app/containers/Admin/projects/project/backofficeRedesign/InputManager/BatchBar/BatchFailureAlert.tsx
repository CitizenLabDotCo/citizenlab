import React from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import styles from './BatchBar.module.css';
import { BatchFailure } from './useBatchActions';

interface Props {
  failure: BatchFailure | undefined;
}

const BatchFailureAlert = ({ failure }: Props) => {
  const { formatMessage } = useIntl();

  if (!failure) return null;

  const { action, failed, total } = failure;

  return (
    <span className={styles.error} role="alert">
      {formatMessage(
        action === 'delete'
          ? messages.batchDeleteFailed
          : messages.batchUpdateFailed,
        { failed, total }
      )}
    </span>
  );
};

export default BatchFailureAlert;
