import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const QuestionHeader = ({ question }: { question: string }) => {
  const { formatMessage } = useIntl();

  return (
    <Tippy
      content={<Box p="4px">{formatMessage(messages.aiSummaryTooltip)}</Box>}
      placement="top"
      zIndex={99999}
    >
      <Box
        display="flex"
        gap="4px"
        alignItems="center"
        p="8px"
        mb="12px"
        w="fit-content"
      >
        <Box>
          <Icon name="alert-circle" fill={colors.orange} />
        </Box>
        <Text fontWeight="bold" m="0px">
          {question}
        </Text>
        <Box>
          <Icon name="question-bubble" width="18px" height="18px" />
        </Box>
      </Box>
    </Tippy>
  );
};

export default QuestionHeader;
