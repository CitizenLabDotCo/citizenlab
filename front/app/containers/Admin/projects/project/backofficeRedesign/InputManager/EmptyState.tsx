import React from 'react';

import DesignSystemEmptyState from 'design-system/EmptyState';

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
        <span className={styles.title}>
          {formatMessage(messages.noTermsTitle, { terms: capitalizedTerms })}
        </span>
        <span>{formatMessage(messages.noTermsDescription, { terms })}</span>
      </span>
    </DesignSystemEmptyState>
  );
};

export default EmptyState;
