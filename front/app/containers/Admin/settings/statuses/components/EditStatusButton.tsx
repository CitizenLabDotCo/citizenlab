import React from 'react';

import { Tooltip, Box, TooltipProps } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from './messages';

interface Props extends TypedLinkProps {
  buttonDisabled: boolean;
  tooltipContent: TooltipProps['content'];
  linkTo?: string;
}

const EditStatusButton = ({
  buttonDisabled,
  tooltipContent,
  to,
  params,
  search,
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
        <ButtonWithLink
          to={to}
          params={params}
          search={search}
          linkTo={linkTo}
          buttonStyle="secondary-outlined"
          icon="edit"
          disabled={buttonDisabled}
          data-testid="e2e-edit-status-button"
        >
          <FormattedMessage {...messages.editButtonLabel} />
        </ButtonWithLink>
      </Box>
    </Tooltip>
  );
};

export default EditStatusButton;
