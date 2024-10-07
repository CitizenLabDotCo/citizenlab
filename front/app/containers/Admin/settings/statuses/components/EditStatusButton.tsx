import React from 'react';

import { Tooltip, Box, TooltipProps } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  buttonDisabled: boolean;
  tooltipContent: TooltipProps['content'];
  linkTo: RouteType;
}

const EditStatusButton = ({
  buttonDisabled,
  tooltipContent,
  linkTo,
}: Props) => {
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
          linkTo={linkTo}
          buttonStyle="secondary-outlined"
          icon="edit"
          disabled={buttonDisabled}
        >
          <FormattedMessage {...messages.editButtonLabel} />
        </Button>
      </Box>
    </Tooltip>
  );
};

export default EditStatusButton;
