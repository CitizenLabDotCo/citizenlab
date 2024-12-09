import React from 'react';

import { Button, Dropdown, Text } from '@citizenlab/cl2-component-library';

import useRequestProjectReview from 'api/project_reviews/useRequestProjectReview';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ReviewRequest = ({
  isOpen,
  onClose,
  projectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}) => {
  const { formatMessage } = useIntl();
  const { mutate: requestProjectReview } = useRequestProjectReview();

  const handleSendRequest = () => {
    requestProjectReview(projectId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dropdown
      opened={isOpen}
      content={
        <div>
          <Text color="textSecondary">
            {formatMessage(messages.requestApprovalDescription)}
          </Text>
          <Button
            buttonStyle="primary"
            onClick={handleSendRequest}
            id="e2e-request-approval-confirm"
          >
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
