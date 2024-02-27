import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import useFeatureFlag from 'hooks/useFeatureFlag';
import React from 'react';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const SummaryHeader = () => {
  const { formatMessage } = useIntl();
  const largeSummariesEnabled = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  return (
    <Box display="flex" gap="4px" alignItems="center">
      {!largeSummariesEnabled && (
        <Icon name="alert-circle" fill={colors.orange} />
      )}
      <Text fontWeight="bold">{formatMessage(messages.aiSummary)}</Text>
      <Icon name="flash" />
    </Box>
  );
};

export default SummaryHeader;
