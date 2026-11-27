import React from 'react';

import Button from 'design-system/Button';
import Text from 'design-system/Text';

import useRequestProjectReview from 'api/project_reviews/useRequestProjectReview';

import messages from 'containers/Admin/projects/project/projectHeader/PublicationButtons/messages';
import tracks from 'containers/Admin/projects/project/projectHeader/PublicationButtons/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import HeaderDropdown from '../HeaderDropdown';

import styles from './ReviewFlow.module.css';
import 'design-system/tokens.css';

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

  const label = formatMessage(
    pending ? messages.pendingApproval : messages.requestApproval
  );

  return (
    <HeaderDropdown
      opened={opened && !pending}
      onOpenChange={handleOpenChange}
      disabled={pending || processing}
      disabledReason={
        pending ? formatMessage(messages.pendingApprovalTooltip) : undefined
      }
      label={label}
      panelLabel={label}
      variant="primary"
      hasMenu={!pending}
      id={pending ? 'e2e-request-approval-pending' : 'e2e-request-approval'}
      panel="approval"
      content={
        <div className={styles.panel}>
          <Text variant="ui" tone="secondary">
            {formatMessage(messages.requestApprovalDescription, {
              inFolder,
            })}
          </Text>
          <Button
            fullWidth
            id="e2e-request-approval-confirm"
            variant="primary"
            size={32}
            onPress={sendRequest}
            isPending={isPending}
          >
            {formatMessage(messages.requestApproval)}
          </Button>
        </div>
      }
    />
  );
};

export default RequestApprovalDropdown;
