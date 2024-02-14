import React from 'react';

// api
import { useSurveyQuestionResult } from 'api/graph_data_units';

// components
import { Title, Text } from '@citizenlab/cl2-component-library';
import MultipleChoice from 'containers/Admin/projects/project/nativeSurvey/FormResults/FormResultsQuestion/MultipleChoice';
import Source from './Source';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

// typings
import { SliceMode } from 'api/graph_data_units/requestTypes';
import {
  Answer,
  SurveyQuestionMultilocs,
} from 'api/graph_data_units/responseTypes';

interface Props {
  projectId: string;
  phaseId: string;
  questionId: string;
  sliceMode?: SliceMode;
  sliceFieldId?: string;
}

const addGroupByValueIfExists = (
  groupByValue: string | undefined,
  multilocs: SurveyQuestionMultilocs
) => {
  return groupByValue && multilocs.group_by_value
    ? { group_by_value: multilocs.group_by_value[groupByValue] }
    : {};
};

const addMultilocs = (
  answers: Answer[],
  multilocs: SurveyQuestionMultilocs
) => {
  return answers.map(({ count, answer, group_by_value }) => ({
    responses: count,
    answer: multilocs.answer[answer],
    ...addGroupByValueIfExists(group_by_value, multilocs),
  }));
};

const SurveyQuestionResult = ({
  projectId,
  phaseId,
  questionId,
  sliceMode,
  sliceFieldId,
}: Props) => {
  const response = useSurveyQuestionResult({
    phaseId,
    questionId,
    sliceMode,
    sliceFieldId,
  });

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!response) return null;

  const { answers, totalResponses, multilocs, question } =
    response.data.attributes;

  return (
    <>
      <Title variant="h4" mt="0px" mb="8px">
        {localize(question)}
      </Title>
      <Text mt="0px" mb="8px" color="textSecondary" variant="bodyS">
        {formatMessage(messages.numberOfResponses, { count: totalResponses })}
      </Text>
      <MultipleChoice
        multipleChoiceAnswers={addMultilocs(answers, multilocs)}
        totalResponses={totalResponses}
      />
      <Source projectId={projectId} phaseId={phaseId} />
    </>
  );
};

export default SurveyQuestionResult;
