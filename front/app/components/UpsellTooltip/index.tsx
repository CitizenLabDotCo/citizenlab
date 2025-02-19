import React from 'react';

import {
  Tooltip,
  TooltipContentWrapper,
  TooltipProps,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props extends TooltipProps {
  // Should only show if a feature is not allowed, so required prop.
  disabled: boolean;
}

const UpsellTooltip = ({ disabled, ...otherProps }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Tooltip
      disabled={disabled}
      content={
        <TooltipContentWrapper tippytheme="light">
          {formatMessage(messages.tooltipContent)}
        </TooltipContentWrapper>
      }
      // "children" is part of the props
      {...otherProps}
    />
  );
};

export default UpsellTooltip;
