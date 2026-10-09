import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import {
  AiAssistantToolCallStatus,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { AiAssistantToolView } from './types';

type Props = {
  toolCall: IAiAssistantToolCallData;
  view: AiAssistantToolView | undefined;
};

const statusLine = (
  status: AiAssistantToolCallStatus
): { icon: IconNames; color: string; message: MessageDescriptor } => {
  switch (status) {
    case 'auto_executed':
      return {
        icon: 'check-circle',
        color: colors.textSecondary,
        message: messages.statusAutoExecuted,
      };
    case 'failed':
      return {
        icon: 'alert-circle',
        color: colors.error,
        message: messages.statusFailed,
      };
    default:
      return {
        icon: 'clock',
        color: colors.textSecondary,
        message: messages.statusInProgress,
      };
  }
};

const ToolCallCard = ({ toolCall, view }: Props) => {
  const { formatMessage } = useIntl();

  const { name, status } = toolCall.attributes;
  const toolLabel = view ? formatMessage(view.label) : name;
  const { icon, color, message } = statusLine(status);

  return (
    <Box display="flex" alignItems="center" gap="6px">
      <Icon name={icon} width="16px" height="16px" fill={color} />
      <Text m="0px" fontSize="s" color="textSecondary">
        {formatMessage(message, { tool: toolLabel })}
      </Text>
    </Box>
  );
};

export default ToolCallCard;
