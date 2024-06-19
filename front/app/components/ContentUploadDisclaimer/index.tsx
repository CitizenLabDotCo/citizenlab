import React from 'react';

import { Text, Box, Button } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ContentUploadDisclaimer = ({
  isDisclaimerOpened,
  onAcceptDisclaimer,
  onCancelDisclaimer,
}: {
  isDisclaimerOpened: boolean;
  onAcceptDisclaimer: (data?: Record<string, any>) => void;
  onCancelDisclaimer: () => void;
}) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      opened={isDisclaimerOpened}
      close={onCancelDisclaimer}
      closeOnClickOutside={true}
      header={formatMessage(messages.contentDisclaimerModalHeader)}
    >
      <Box m="32px">
        <Text mb="32px">
          {formatMessage(messages.contentUploadDisclaimerFull)}
        </Text>
        <Box display="flex" justifyContent="flex-end" gap="16px">
          <Button onClick={onCancelDisclaimer} buttonStyle="secondary-outlined">
            {formatMessage(messages.onCancel)}
          </Button>
          <Button onClick={onAcceptDisclaimer} id="e2e-accept-disclaimer">
            {formatMessage(messages.onAccept)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ContentUploadDisclaimer;
