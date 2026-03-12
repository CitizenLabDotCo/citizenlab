import React from 'react';

import { Button, fontSizes } from '@citizenlab/cl2-component-library';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

interface Props {
  processing?: boolean;
  message: MessageDescriptor;
  onClick: () => void;
}

const RemoveFromSpaceButton = ({
  processing = false,
  message,
  onClick,
}: Props) => {
  return (
    <Button
      buttonStyle="text"
      icon="minus-circle"
      fontSize={`${fontSizes.s}px`}
      iconSize={`${fontSizes.base}px`}
      processing={processing}
      onClick={onClick}
    >
      <FormattedMessage {...message} />
    </Button>
  );
};

export default RemoveFromSpaceButton;
