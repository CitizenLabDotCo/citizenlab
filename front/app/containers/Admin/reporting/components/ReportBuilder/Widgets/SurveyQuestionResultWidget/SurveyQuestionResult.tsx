import React from 'react';

// api
import { useSurveyQuestionResult } from 'api/graph_data_units';

interface Props {
  phaseId: string;
  fieldId: string;
}

const SurveyQuestionResult = ({ phaseId, fieldId }: Props) => {
  const res = useSurveyQuestionResult({ phaseId, fieldId });
  console.log({ res });
  return (
    <>
      Phase ID: {phaseId}
      Field ID: {fieldId}
    </>
  );
};

export default SurveyQuestionResult;
