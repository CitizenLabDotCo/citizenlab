import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';
import Text from 'design-system/Text';

import { useIntl } from 'utils/cl-intl';

import styles from './CommonGroundManager.module.css';
import messages from './messages';

const EmptyList = () => {
  const { formatMessage } = useIntl();

  return (
    <DesignSystemEmptyState>
      <span className={styles.emptyContent}>
        <Text as="span" variant="uiStrong" tone="primary">
          {formatMessage(messages.noReactionsTitle)}
        </Text>
        <span>{formatMessage(messages.noReactionsDescription)}</span>
      </span>
    </DesignSystemEmptyState>
  );
};

export default EmptyList;
