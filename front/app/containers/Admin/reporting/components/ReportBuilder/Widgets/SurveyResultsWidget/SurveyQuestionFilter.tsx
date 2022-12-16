import React, { ChangeEvent } from 'react';
import useProject from 'hooks/useProject';
import useFormResults from 'hooks/useFormResults';
import { isNilOrError } from 'utils/helperUtils';
import { Box, Checkbox, Text } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import messages from './messages';
import { useIntl } from '../../../../../../../utils/cl-intl';

type SurveyQuestionFilterProps = {
  projectId: string;
  phaseId: string;
  showQuestions: number[] | undefined;
  onToggleQuestion: (showQuestions: number[]) => void;
};

const SurveyQuestionFilter = ({
  projectId,
  phaseId,
  showQuestions,
  onToggleQuestion,
}: SurveyQuestionFilterProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const project = useProject({ projectId });
  const formResults = useFormResults({
    projectId,
    phaseId,
  });

  if (isNilOrError(formResults) || isNilOrError(project)) {
    // This never seems to get shown
    return (
      <Text variant="bodyM" color="textSecondary">
        {formatMessage(messages.surveyNoQuestions)}
      </Text>
    );
  }

  const { results } = formResults;
  if (results.length === 0) {
    return null;
  }

  // Initialise which questions are checked
  let selectedQuestions: number[] = [];
  if (showQuestions !== undefined) {
    selectedQuestions = showQuestions;
  } else {
    for (let i = 0; i <= results.length - 1; i++) {
      selectedQuestions.push(i);
    }
    onToggleQuestion(selectedQuestions);
  }

  // Add/remove from selected questions
  const toggleQuestion =
    (questionIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      const findIndex = selectedQuestions.indexOf(questionIndex);
      if (findIndex > -1) {
        const questionCopy = [...selectedQuestions];
        questionCopy.splice(findIndex, 1);
        selectedQuestions = questionCopy;
      } else {
        selectedQuestions = [...selectedQuestions, questionIndex];
      }
      onToggleQuestion(selectedQuestions);
    };

  return (
    <Box mb="20px">
      <Text variant="bodyM" color="textSecondary">
        {formatMessage(messages.surveyChooseQuestions)}
      </Text>
      {results.map(({ question }, index) => {
        return (
          <Box key={index} mb="10px">
            <Checkbox
              checked={selectedQuestions.includes(index)}
              onChange={toggleQuestion(index)}
              label={localize(question)}
            />
          </Box>
        );
      })}
    </Box>
  );
};
export default SurveyQuestionFilter;
