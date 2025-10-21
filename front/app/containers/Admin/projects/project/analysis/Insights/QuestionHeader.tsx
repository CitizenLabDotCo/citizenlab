import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const QuestionHeader = ({
  question,
  showAiWarning = true,
}: {
  question: string;
  showAiWarning?: boolean;
}) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" gap="8px" alignItems="center" w="fit-content">
      {showAiWarning && (
        <Box>
          <Tooltip
            content={
              <Box p="4px">{formatMessage(messages.aiSummaryTooltip)}</Box>
            }
            placement="bottom"
            zIndex={99999}
          >
            <Icon name="alert-circle" fill={colors.orange500} />
          </Tooltip>
        </Box>
      )}

      {!showAiWarning && (
        <Box>
          <Icon name="question-bubble" width="18px" height="18px" />
        </Box>
      )}

      <Text fontWeight="bold" m="0px">
        {question}
      </Text>

      {showAiWarning && (
        <Box>
          <Icon name="question-bubble" width="18px" height="18px" />
        </Box>
      )}
    </Box>
  );
};

export default QuestionHeader;
