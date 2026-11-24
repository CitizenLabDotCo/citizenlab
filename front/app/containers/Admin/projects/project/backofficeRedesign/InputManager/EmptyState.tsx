import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';
import Text from 'design-system/Text';

import { useIntl } from 'utils/cl-intl';

import styles from './EmptyState.module.css';
import messages from './messages';
import useInputTermLabels from './useInputTermLabels';

const EmptyState = () => {
  const { formatMessage } = useIntl();
  const { terms, capitalizedTerms } = useInputTermLabels();

  return (
    <DesignSystemEmptyState>
      <span className={styles.content}>
        <Text as="span" variant="uiStrong" tone="primary">
          {formatMessage(messages.noTermsTitle, { terms: capitalizedTerms })}
        </Text>
        <span>{formatMessage(messages.noTermsDescription, { terms })}</span>
      </span>
    </DesignSystemEmptyState>
  );
};

export default EmptyState;
