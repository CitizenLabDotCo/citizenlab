import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Analysis from './Analysis';
import AnalysisUpsell from './AnalysisUpsell';
import TextResponses from './TextResponses';
import { TextResponseSource } from './utils';

interface Props {
  textResponses: { answer: string }[];
  customFieldId: string;
  textResponseSource?: TextResponseSource;
}

const TextQuestion = ({
  textResponses,
  customFieldId,
  textResponseSource,
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
          textResponseSource={textResponseSource}
        />
      </Box>
      <Box flex="1">
        {!isAnalysisAllowed && <AnalysisUpsell />}
        {isAnalysisEnabled && (
          <Analysis
            customFieldId={customFieldId}
            textResponsesCount={textResponses.length}
            textResponseSource={textResponseSource}
          />
        )}
      </Box>
    </Box>
  );
};

export default TextQuestion;
