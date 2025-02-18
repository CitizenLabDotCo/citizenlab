import React from 'react';

import {
  Tooltip,
  TooltipContentWrapper,
  TooltipProps,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const UpsellTooltip = ({ disabled, children, ...otherProps }: TooltipProps) => {
  const { formatMessage } = useIntl();
  return (
    <Tooltip
      disabled={disabled}
      content={
        <TooltipContentWrapper tippytheme="light">
          {formatMessage(messages.tooltipContent)}
        </TooltipContentWrapper>
      }
      {...otherProps}
    >
      {children}
    </Tooltip>
  );
};

export default UpsellTooltip;
