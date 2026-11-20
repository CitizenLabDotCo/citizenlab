import React from 'react';

import Button from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import styles from './BatchBar.module.css';

interface Props {
  label: string;
  processing: boolean;
  failed: boolean;
  onClick: () => void;
}

const SelectAllButton = ({ label, processing, failed, onClick }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Button
        variant="quiet"
        size={28}
        isPending={processing}
        onPress={onClick}
      >
        {label}
      </Button>
      {failed && (
        <span className={styles.error} role="alert">
          {formatMessage(messages.selectAllFailed)}
        </span>
      )}
    </>
  );
};

export default SelectAllButton;
