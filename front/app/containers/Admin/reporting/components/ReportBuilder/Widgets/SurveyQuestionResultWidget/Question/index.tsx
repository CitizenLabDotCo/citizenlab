import React from 'react';

// api
import { useSurveyQuestionResult } from 'api/graph_data_units';

// components
import { Title, Text } from '@citizenlab/cl2-component-library';
import MultipleChoice from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/MultipleChoice';
import Source from './Source';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  projectId: string;
  phaseId: string;
  questionId: string;
}

const SurveyQuestionResult = ({ projectId, phaseId, questionId }: Props) => {
  const response = useSurveyQuestionResult({ phaseId, questionId });
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!response) return null;

  const { answers, totalResponses, question } = response.data.attributes;
  if (!answers) return null;

  return (
    <>
      <Title variant="h4" mt="0px" mb="8px">
        {localize(question)}
      </Title>
      <Text mt="0px" mb="8px" color="textSecondary" variant="bodyS">
        {formatMessage(messages.numberOfResponses, { count: totalResponses })}
      </Text>
      <MultipleChoice
        multipleChoiceAnswers={answers}
        totalResponses={totalResponses}
      />
      <Source projectId={projectId} phaseId={phaseId} />
    </>
  );
};

export default SurveyQuestionResult;
