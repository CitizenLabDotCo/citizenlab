import React from 'react';

import { Button, Dropdown, Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ReviewRequest = ({
  isOpen,
  onClose,
  sendRequest,
}: {
  isOpen: boolean;
  onClose: () => void;
  sendRequest: () => Promise<void>;
}) => {
  const { formatMessage } = useIntl();
  const handleSendRequest = async () => {
    await sendRequest();
    onClose();
  };

  return (
    <Dropdown
      opened={isOpen}
      content={
        <div>
          <Text color="textSecondary">
            {formatMessage(messages.requestApprovalDescription)}
          </Text>
          <Button buttonStyle="primary" onClick={handleSendRequest}>
            {formatMessage(messages.requestApproval)}
          </Button>
        </div>
      }
      top={'40px'}
      right={'0px'}
      zIndex="2000"
      width="400px"
      onClickOutside={onClose}
    />
  );
};

export default ReviewRequest;
