import React from 'react';

// api
import { useSurveyQuestionResult } from 'api/graph_data_units';

// components
import { Box } from '@citizenlab/cl2-component-library';
import FormResultsQuestion from '../SurveyResultsWidget/FormResultsQuestion';

interface Props {
  phaseId: string;
  fieldId: string;
}

const SurveyQuestionResult = ({ phaseId, fieldId }: Props) => {
  const response = useSurveyQuestionResult({ phaseId, fieldId });
  if (!response) return null;

  const { result } = response.data.attributes;

  return (
    <Box>
      <FormResultsQuestion
        locale="en"
        question={result.question}
        inputType={result.inputType}
        answers={result.answers}
        totalResponses={result.totalResponses}
        required={result.required}
        customFieldId={result.customFieldId}
        textResponses={result.textResponses}
      />
    </Box>
  );
};

export default SurveyQuestionResult;
