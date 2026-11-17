import React from 'react';

import Button from 'design-system/Button';
import Tooltip from 'design-system/Tooltip';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';

import messages from 'containers/Admin/projects/project/projectHeader/PublicationButtons/messages';

import { useIntl } from 'utils/cl-intl';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
}

const ApproveButton = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: approveProjectReview, isPending } = useApproveProjectReview();

  return (
    <Tooltip
      content={formatMessage(messages.approveTooltip)}
      placement="bottom"
    >
      <Button
        id="e2e-approve-project"
        variant="secondary"
        size={32}
        onPress={() => approveProjectReview(projectId)}
        isPending={isPending}
      >
        {formatMessage(messages.approve)}
      </Button>
    </Tooltip>
  );
};

export default ApproveButton;
