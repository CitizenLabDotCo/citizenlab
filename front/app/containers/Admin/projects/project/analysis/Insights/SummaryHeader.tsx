import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import React from 'react';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import Tippy from '@tippyjs/react';

const SummaryHeader = () => {
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
        <Icon name="alert-circle" fill={colors.orange} mr="4px" />
        <Text m="0px" fontWeight="bold">
          {formatMessage(messages.aiSummary)}
        </Text>
        <Icon name="flash" />
      </Box>
    </Tippy>
  );
};

export default SummaryHeader;
