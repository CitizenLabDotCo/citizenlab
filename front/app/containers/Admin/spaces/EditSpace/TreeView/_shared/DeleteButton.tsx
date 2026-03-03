import React from 'react';

import { Button, fontSizes } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const DeleteButton = () => {
  return (
    <Button
      buttonStyle="delete"
      icon="delete"
      fontSize={`${fontSizes.s}px`}
      iconSize={`${fontSizes.base}px`}
      px="8px"
      py="4px"
    >
      <FormattedMessage {...messages.remove} />
    </Button>
  );
};

export default DeleteButton;
