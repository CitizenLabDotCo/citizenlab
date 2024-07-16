import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Analysis from './Analysis';
import AnalysisUpsell from './AnalysisUpsell';
import TextResponses from './TextResponses';

interface Props {
  textResponses: { answer: string }[];
  showAnalysis?: boolean;
  customFieldId: string;
  hasOtherResponses?: boolean;
}

const TextQuestion = ({
  textResponses,
  showAnalysis = true,
  customFieldId,
  hasOtherResponses,
}: Props) => {
  const isAnalysisEnabled = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });

  return (
    <Box display="flex" gap="24px" mt="20px">
      <Box flex="1">
        <TextResponses
          textResponses={textResponses}
          hasOtherResponses={hasOtherResponses}
        />
      </Box>
      <Box flex="1">
        {!isAnalysisEnabled && showAnalysis && <AnalysisUpsell />}
        {isAnalysisEnabled && showAnalysis && !hasOtherResponses && (
          <Analysis
            customFieldId={customFieldId}
            textResponsesCount={textResponses.length}
          />
        )}
      </Box>
    </Box>
  );
};

export default TextQuestion;
