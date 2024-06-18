import React from 'react';

import { Tooltip, TooltipProps } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  tooltipDisabled: TooltipProps['disabled'];
  buttonDisabled: boolean;
  tooltipContent: TooltipProps['content'];
  linkTo: RouteType;
}

const EditStatusButton = ({
  tooltipDisabled,
  buttonDisabled,
  tooltipContent: content,
  linkTo,
}: Props) => {
  return (
    <Tooltip
      placement="top"
      theme="light"
      disabled={tooltipDisabled}
      content={content}
      trigger="mouseenter"
    >
      <Button
        linkTo={linkTo}
        buttonStyle="secondary-outlined"
        icon="edit"
        disabled={buttonDisabled}
      >
        <FormattedMessage {...messages.editButtonLabel} />
      </Button>
    </Tooltip>
  );
};

export default EditStatusButton;
