import React from 'react';

import {
  Tooltip,
  TooltipContentWrapper,
  TooltipProps,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const UpsellTooltip = (props: TooltipProps) => {
  const { formatMessage } = useIntl();
  return (
    <Tooltip
      content={
        <TooltipContentWrapper tippytheme="light">
          {formatMessage(messages.tooltipContent)}
        </TooltipContentWrapper>
      }
      // "children" is part of the props
      {...props}
    />
  );
};

export default UpsellTooltip;
