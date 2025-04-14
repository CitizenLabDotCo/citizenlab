import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Analysis from './Analysis';
import AnalysisUpsell from './AnalysisUpsell';
import TextResponses from './TextResponses';

interface Props {
  textResponses: { answer: string }[];
  customFieldId: string;
  hasOtherResponses?: boolean;
}

const TextQuestion = ({
  textResponses,
  customFieldId,
  hasOtherResponses,
}: Props) => {
  const isAnalysisAllowed = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });
  const isAnalysisEnabled = useFeatureFlag({
    name: 'analysis',
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
        {!isAnalysisAllowed && <AnalysisUpsell />}
        {isAnalysisEnabled && (
          <Analysis
            customFieldId={customFieldId}
            textResponsesCount={textResponses.length}
            hasOtherResponses={hasOtherResponses}
          />
        )}
      </Box>
    </Box>
  );
};

export default TextQuestion;
