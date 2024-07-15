import React from 'react';

import {
  Tooltip as BaseTooltip,
  TooltipProps,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  disabled: boolean;
  placement?: TooltipProps['placement'];
  children: TooltipProps['children'];
}

const Tooltip = ({ disabled, placement = 'right', children }: Props) => {
  return (
    <BaseTooltip
      disabled={disabled}
      content={<FormattedMessage {...messages.disableEditingExplanation} />}
      placement={placement}
      theme="dark"
    >
      {children}
    </BaseTooltip>
  );
};

export default Tooltip;
