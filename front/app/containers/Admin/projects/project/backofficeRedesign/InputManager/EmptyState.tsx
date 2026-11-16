import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';

import { useIntl } from 'utils/cl-intl';

import styles from './EmptyState.module.css';
import messages from './messages';

const EmptyState = () => {
  const { formatMessage } = useIntl();

  return (
    <DesignSystemEmptyState>
      <span className={styles.content}>
        <span className={styles.title}>
          {formatMessage(messages.noInputsTitle)}
        </span>
        <span>{formatMessage(messages.noInputsDescription)}</span>
      </span>
    </DesignSystemEmptyState>
  );
};

export default EmptyState;
