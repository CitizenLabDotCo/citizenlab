import React from 'react';

// api
import { useSurveyQuestionResult } from 'api/graph_data_units';

// components
import { Title } from '@citizenlab/cl2-component-library';
import MultipleChoice from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/MultipleChoice';

// i18n
import useLocalize from 'hooks/useLocalize';

interface Props {
  phaseId: string;
  fieldId: string;
}

const SurveyQuestionResult = ({ phaseId, fieldId }: Props) => {
  const response = useSurveyQuestionResult({ phaseId, fieldId });
  const localize = useLocalize();
  if (!response) return null;

  const { answers, totalResponses, question } = response.data.attributes.result;
  if (!answers) return null;

  return (
    <>
      <Title variant="h4" mt="0px">
        {localize(question)}
      </Title>
      <MultipleChoice
        multipleChoiceAnswers={answers}
        totalResponses={totalResponses}
      />
    </>
  );
};

export default SurveyQuestionResult;
