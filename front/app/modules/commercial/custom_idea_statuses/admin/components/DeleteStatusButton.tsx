import React from 'react';

import {
  Tooltip,
  TooltipProps,
  colors,
} from '@citizenlab/cl2-component-library';

import useDeleteIdeaStatus from 'api/idea_statuses/useDeleteIdeaStatus';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  tooltipDisabled: TooltipProps['disabled'];
  buttonDisabled: boolean;
  tooltipContent: TooltipProps['content'];
  ideaStatusId: string;
}

const DeleteStatusButton = ({
  tooltipDisabled,
  buttonDisabled,
  tooltipContent,
  ideaStatusId,
}: Props) => {
  const { mutate: deleteIdeaStatus } = useDeleteIdeaStatus();

  return (
    <Tooltip
      placement="top"
      theme="light"
      disabled={tooltipDisabled}
      content={tooltipContent}
      trigger="mouseenter"
    >
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
    </Tooltip>
  );
};

export default DeleteStatusButton;
