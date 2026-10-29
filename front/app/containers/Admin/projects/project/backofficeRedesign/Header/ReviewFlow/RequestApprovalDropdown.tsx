import React from 'react';

import { Box, Button, Text, Tooltip } from '@citizenlab/cl2-component-library';

import useRequestProjectReview from 'api/project_reviews/useRequestProjectReview';

import messages from 'containers/Admin/projects/project/projectHeader/PublicationButtons/messages';
import tracks from 'containers/Admin/projects/project/projectHeader/PublicationButtons/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import HeaderDropdown from '../HeaderDropdown';

interface Props {
  projectId: string;
  inFolder: boolean;
  pending: boolean;
  processing: boolean;
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
}

const RequestApprovalDropdown = ({
  projectId,
  inFolder,
  pending,
  processing,
  opened,
  onOpenChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: requestProjectReview, isPending } = useRequestProjectReview();

  const handleOpenChange = (nextOpened: boolean) => {
    if (nextOpened) trackEventByName(tracks.projectReviewDropdownOpened);
    onOpenChange(nextOpened);
  };

  const sendRequest = () =>
    requestProjectReview(projectId, {
      onSuccess: () => {
        onOpenChange(false);
        trackEventByName(tracks.projectReviewRequested);
      },
    });

  return (
    <Tooltip
      content={formatMessage(messages.pendingApprovalTooltip)}
      theme="dark"
      placement="bottom"
      disabled={!pending}
    >
      <Box>
        <HeaderDropdown
          opened={opened && !pending}
          onOpenChange={handleOpenChange}
          disabled={pending || processing}
          label={formatMessage(
            pending ? messages.pendingApproval : messages.requestApproval
          )}
          buttonStyle="bo-primary"
          icon={pending ? undefined : 'chevron-down'}
          id={pending ? 'e2e-request-approval-pending' : 'e2e-request-approval'}
          width="380px"
          content={
            <Box>
              <Text variant="boHelper" m="0" mb="16px">
                {formatMessage(messages.requestApprovalDescription, {
                  inFolder,
                })}
              </Text>
              <Button
                buttonStyle="bo-primary"
                width="100%"
                icon="send"
                onClick={sendRequest}
                processing={isPending}
                id="e2e-request-approval-confirm"
              >
                {formatMessage(messages.requestApproval)}
              </Button>
            </Box>
          }
        />
      </Box>
    </Tooltip>
  );
};

export default RequestApprovalDropdown;
