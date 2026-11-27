import React from 'react';

import Button from 'design-system/Button';
import Text from 'design-system/Text';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

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
        <Text as="span" variant="small" tone="danger" role="alert">
          {formatMessage(messages.selectAllFailed)}
        </Text>
      )}
    </>
  );
};

export default SelectAllButton;
