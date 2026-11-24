import React from 'react';

import Button from 'design-system/Button';
import Text from 'design-system/Text';

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
      <Text variant="ui" tone="secondary">
        {message ?? formatMessage(messages.listLoadFailed)}
      </Text>
      <Button variant="secondary" size={32} onPress={onRetry}>
        {retryLabel ?? formatMessage(messages.retryListLoad)}
      </Button>
    </div>
  );
};

export default ListLoadError;
