import React from 'react';

import { Icon, Spinner, colors } from '@citizenlab/cl2-component-library';

import { AiAssistantToolCallStatus } from 'api/ai_assistant_tool_calls/types';

import { PulsingDot } from '../animations';

type Props = {
  status: AiAssistantToolCallStatus;
};

const ToolCallStatusIcon = ({ status }: Props) => {
  switch (status) {
    case 'awaiting_user':
      return <PulsingDot />;
    case 'approved':
      return <Spinner size="14px" />;
    case 'executed':
    case 'auto_executed':
      return <Icon name="check-circle" width="16px" fill={colors.green500} />;
    case 'failed':
      return <Icon name="alert-circle" width="16px" fill={colors.error} />;
    case 'rejected':
      return <Icon name="edit" width="16px" fill={colors.coolGrey600} />;
    default:
      return <Icon name="clock" width="16px" fill={colors.coolGrey600} />;
  }
};

export default ToolCallStatusIcon;
