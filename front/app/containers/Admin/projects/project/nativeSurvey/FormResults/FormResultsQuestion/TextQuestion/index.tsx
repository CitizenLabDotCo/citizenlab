import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box } from '@citizenlab/cl2-component-library';
import TextResponses from './TextResponses';
import Analysis from './Analysis';

interface Props {
  textResponses: { answer: string }[];
  showAnalysis?: boolean;
  customFieldId: string;
}

const TextQuestion = ({
  textResponses,
  showAnalysis = true,
  customFieldId,
}: Props) => {
  const isAnalysisEnabled = useFeatureFlag({ name: 'analysis' });

  return (
    <Box display="flex" gap="24px">
      <Box flex="1">
        <TextResponses textResponses={textResponses} />
      </Box>
      <Box flex="1">
        {isAnalysisEnabled && showAnalysis && (
          <Analysis customFieldId={customFieldId} />
        )}
      </Box>
    </Box>
  );
};

export default TextQuestion;
