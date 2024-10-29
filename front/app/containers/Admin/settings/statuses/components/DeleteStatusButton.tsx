import React from 'react';

import {
  Tooltip,
  TooltipProps,
  colors,
  Box,
} from '@citizenlab/cl2-component-library';

import useDeleteIdeaStatus from 'api/idea_statuses/useDeleteIdeaStatus';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  buttonDisabled: boolean;
  tooltipContent: TooltipProps['content'];
  ideaStatusId: string;
}

const DeleteStatusButton = ({
  buttonDisabled,
  tooltipContent,
  ideaStatusId,
}: Props) => {
  const { mutate: deleteIdeaStatus } = useDeleteIdeaStatus();
  const tooltipDisabled = !buttonDisabled;

  return (
    <Tooltip
      placement="top"
      theme="light"
      disabled={tooltipDisabled}
      content={tooltipContent}
      trigger="mouseenter"
    >
      <Box>
        <Button
          onClick={() => deleteIdeaStatus(ideaStatusId)}
          buttonStyle="text"
          disabled={buttonDisabled}
          icon="delete"
          iconHoverColor={colors.red600}
          textHoverColor={colors.red600}
        >
          <FormattedMessage {...messages.deleteButtonLabel} />
        </Button>
      </Box>
    </Tooltip>
  );
};

export default DeleteStatusButton;
