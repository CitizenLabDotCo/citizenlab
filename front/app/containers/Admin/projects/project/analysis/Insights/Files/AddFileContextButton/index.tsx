import React from 'react';

import { Box, Button, IconTooltip } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
};
const AddFileContext = ({ setIsFileSelectionOpen }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex" alignItems="center" gap="4px">
      <IconTooltip
        mb="4px"
        content={formatMessage(messages.attachFilesTooltip)}
        iconSize="20px"
        icon="info-outline"
      />

      <Button
        icon="plus"
        iconPos="right"
        text={formatMessage(messages.attachFiles)}
        buttonStyle="text"
        iconSize="20px"
        pl="0px"
        fontSize="s"
        onClick={() => setIsFileSelectionOpen(true)}
      />
    </Box>
  );
};

export default AddFileContext;
