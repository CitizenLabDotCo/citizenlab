import React from 'react';

import {
  Tooltip,
  TooltipContentWrapper,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  disabled: boolean;
  // ReactNode as a type wouldn't work here as a type since that can be null
  children: JSX.Element;
}

const UpsellTooltip = ({ disabled, children }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Tooltip
      disabled={disabled}
      content={
        <TooltipContentWrapper tippytheme="light">
          {formatMessage(messages.tooltipContent)}
        </TooltipContentWrapper>
      }
    >
      {children}
    </Tooltip>
  );
};

export default UpsellTooltip;
