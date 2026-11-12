import React from 'react';

import { Button, Text } from '@citizenlab/cl2-component-library';

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
      <Button buttonStyle="bo-text" processing={processing} onClick={onClick}>
        {label}
      </Button>
      {failed && (
        <Text as="span" variant="boHelper" color="red600" m="0" role="alert">
          {formatMessage(messages.selectAllFailed)}
        </Text>
      )}
    </>
  );
};

export default SelectAllButton;
