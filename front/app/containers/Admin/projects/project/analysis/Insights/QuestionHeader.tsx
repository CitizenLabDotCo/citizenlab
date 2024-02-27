import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import useFeatureFlag from 'hooks/useFeatureFlag';
import React from 'react';

const QuestionHeader = ({ question }: { question: string }) => {
  const largeSummariesEnabled = useFeatureFlag({
    name: 'large_summaries',
    onlyCheckAllowed: true,
  });

  return (
    <Box display="flex" gap="4px" alignItems="center">
      {!largeSummariesEnabled && (
        <Icon name="alert-circle" fill={colors.orange} />
      )}
      <Text fontWeight="bold">{question}</Text>
      <Icon name="question-bubble" width="20px" height="20px" />
    </Box>
  );
};

export default QuestionHeader;
