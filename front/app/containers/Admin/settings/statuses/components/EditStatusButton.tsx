import React from 'react';

import { Tooltip, Box, TooltipProps } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

import type { LinkProps } from '@tanstack/react-router';

interface Props {
  buttonDisabled: boolean;
  tooltipContent: TooltipProps['content'];
  to?: LinkProps['to'];
  params?: Record<string, string>;
  search?: Record<string, unknown>;
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
