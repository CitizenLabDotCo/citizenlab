import React from 'react';

import { Button, fontSizes } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  processing?: boolean;
  onClick: () => void;
}

const RemoveFromSpaceButton = ({ processing = false, onClick }: Props) => {
  return (
    <Button
      buttonStyle="text"
      icon="minus-circle"
      fontSize={`${fontSizes.s}px`}
      iconSize={`${fontSizes.base}px`}
      processing={processing}
      onClick={onClick}
    >
      <FormattedMessage {...messages.removeFromSpace} />
    </Button>
  );
};

export default RemoveFromSpaceButton;
