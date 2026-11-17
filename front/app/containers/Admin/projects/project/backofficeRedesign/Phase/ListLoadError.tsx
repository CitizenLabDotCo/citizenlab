import React from 'react';

import Button from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';

import styles from './ListLoadError.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  onRetry: () => void;
  message?: string;
  retryLabel?: string;
}

const ListLoadError = ({ onRetry, message, retryLabel }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div role="alert" className={styles.error}>
      <p className={styles.message}>
        {message ?? formatMessage(messages.listLoadFailed)}
      </p>
      <Button variant="secondary" size={32} onPress={onRetry}>
        {retryLabel ?? formatMessage(messages.retryListLoad)}
      </Button>
    </div>
  );
};

export default ListLoadError;
