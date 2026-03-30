import React, { useRef, useEffect } from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface SubmitConfirmationProps {
  onContinueEditing: () => void;
  onConfirmSubmit: () => void;
}

const SubmitConfirmation = ({
  onContinueEditing,
  onConfirmSubmit,
}: SubmitConfirmationProps) => {
  const { formatMessage } = useIntl();
  const continueEditingRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueEditingRef.current?.focus();
  }, []);

  return (
    <Box
      role="alert"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="12px"
      p="16px"
      bgColor={colors.grey100}
      borderTop={`1px solid ${colors.grey300}`}
    >
      <Text fontSize="base" color="tenantText" fontWeight="semi-bold" m="0px">
        {formatMessage(messages.submitConfirmation)}
      </Text>
      <Box display="flex" gap="12px">
        <Button
          ref={continueEditingRef}
          buttonStyle="secondary-outlined"
          onClick={onContinueEditing}
          type="button"
        >
          {formatMessage(messages.continueEditing)}
        </Button>
        <Button buttonStyle="primary" onClick={onConfirmSubmit} type="button">
          {formatMessage(messages.yesSubmit)}
        </Button>
      </Box>
    </Box>
  );
};

export default SubmitConfirmation;
