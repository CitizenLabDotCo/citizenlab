import React, { useState } from 'react';

import { Button, Tooltip } from '@citizenlab/cl2-component-library';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';

import ReviewRequestDropdown from './ReviewRequestDropdown';

interface Props {
  projectId: string;
  approvalPending: boolean;
  processing: boolean;
}

const ReviewRequestButton = ({
  projectId,
  approvalPending,
  processing,
}: Props) => {
  const [isProjectReviewDropdownOpened, setIsProjectReviewDropdownOpened] =
    useState(false);
  const { formatMessage } = useIntl();

  return (
    <>
      <Tooltip
        content={formatMessage(messages.pendingApprovalTooltip)}
        placement="bottom"
        disabled={!approvalPending}
      >
        <Button
          buttonStyle="admin-dark"
          icon="send"
          onClick={() => setIsProjectReviewDropdownOpened(true)}
          processing={processing}
          size="s"
          padding="4px 8px"
          iconSize="20px"
          disabled={approvalPending}
          data-cy={
            approvalPending
              ? 'e2e-request-approval-pending'
              : 'e2e-request-approval'
          }
          className="intercom-admin-project-request-approval-button"
        >
          {approvalPending
            ? formatMessage(messages.pendingApproval)
            : formatMessage(messages.requestApproval)}
        </Button>
      </Tooltip>
      <ReviewRequestDropdown
        isOpen={isProjectReviewDropdownOpened}
        onClose={() => {
          setIsProjectReviewDropdownOpened(false);
          trackEventByName(tracks.projectReviewDropdownOpened);
        }}
        projectId={projectId}
      />
    </>
  );
};

export default ReviewRequestButton;
