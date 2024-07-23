import React from 'react';

import {
  Tooltip as BaseTooltip,
  TooltipProps,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  disabled: boolean;
  placement?: TooltipProps['placement'];
  message?: MessageDescriptor;
  children: TooltipProps['children'];
}

const Tooltip = ({
  disabled,
  placement = 'right',
  message = messages.disableEditingExplanation,
  children,
}: Props) => {
  return (
    <BaseTooltip
      disabled={disabled}
      content={<FormattedMessage {...message} />}
      placement={placement}
      theme="dark"
    >
      {children}
    </BaseTooltip>
  );
};

export default Tooltip;
