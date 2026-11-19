import React from 'react';

import Button from 'design-system/Button';
import DesignSystemEmptyState from 'design-system/EmptyState';

import postManagerMessages from 'components/admin/PostManager/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './EmptyState.module.css';

interface Props {
  onClearFilters: () => void;
}

const NoMatches = ({ onClearFilters }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <DesignSystemEmptyState>
      <span className={styles.content}>
        <span className={styles.title}>
          {formatMessage(postManagerMessages.noFilteredResults)}
        </span>
        <span>
          {formatMessage(postManagerMessages.resetInputFiltersDescription)}
        </span>
        <span>
          <Button onPress={onClearFilters}>
            {formatMessage(postManagerMessages.resetFiltersButton)}
          </Button>
        </span>
      </span>
    </DesignSystemEmptyState>
  );
};

export default NoMatches;
