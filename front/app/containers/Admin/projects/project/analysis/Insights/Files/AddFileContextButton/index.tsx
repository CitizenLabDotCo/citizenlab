import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
};
const AddFileContext = ({ setIsFileSelectionOpen }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex" alignItems="center">
      <Button
        icon="plus-circle"
        text={formatMessage(messages.attachFiles)}
        buttonStyle="text"
        iconSize="20px"
        fontSize="s"
        onClick={() => setIsFileSelectionOpen(true)}
      />
    </Box>
  );
};

export default AddFileContext;
