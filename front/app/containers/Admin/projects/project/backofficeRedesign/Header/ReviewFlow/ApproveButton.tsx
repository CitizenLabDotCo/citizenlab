import React from 'react';

import { Box, Button, Tooltip, bo } from '@citizenlab/cl2-component-library';

import useApproveProjectReview from 'api/project_reviews/useApproveProject';

import messages from 'containers/Admin/projects/project/projectHeader/PublicationButtons/messages';

import { useIntl } from 'utils/cl-intl';

interface Props {
  projectId: string;
}

const ApproveButton = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: approveProjectReview, isPending } = useApproveProjectReview();

  return (
    <Tooltip
      content={formatMessage(messages.approveTooltip)}
      theme="dark"
      placement="bottom"
    >
      <Box>
        <Button
          buttonStyle="bo-secondary"
          icon="unlock"
          height={bo.buttonMedium.height}
          padding={bo.buttonMedium.padding}
          fontSize={bo.buttonMedium.fontSize}
          iconSize={bo.buttonMedium.iconSize}
          onClick={() => approveProjectReview(projectId)}
          processing={isPending}
          id="e2e-approve-project"
        >
          {formatMessage(messages.approve)}
        </Button>
      </Box>
    </Tooltip>
  );
};

export default ApproveButton;
