import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  disabled?: boolean;
  onClose: () => void;
  onAssign: () => Promise<void>;
}

const AssignButton = ({ disabled, onClose, onAssign }: Props) => {
  const { formatMessage } = useIntl();
  const [isLoading, setIsLoading] = useState(false);

  const doAssign = async () => {
    setIsLoading(true);
    await onAssign();
    setIsLoading(false);
    onClose();
  };

  return (
    <>
      <Box display="flex" justifyContent="flex-end" mt="20px">
        <Button onClick={doAssign} disabled={disabled} processing={isLoading}>
          {formatMessage(messages.assign)}
        </Button>
      </Box>
    </>
  );
};

export default AssignButton;
