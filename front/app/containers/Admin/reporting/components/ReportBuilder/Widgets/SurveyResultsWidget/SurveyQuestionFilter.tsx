import React, { ChangeEvent } from 'react';

// hooks
import useProject from 'hooks/useProject';
import useFormResults from 'hooks/useFormResults';
import useLocalize from 'hooks/useLocalize';

// utils
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { Box, Checkbox, Text } from '@citizenlab/cl2-component-library';

// messages
import messages from './messages';

interface Props {
  projectId: string;
  phaseId?: string;
  shownQuestions?: boolean[];
  onToggleQuestion: (questionIndex: number, numberOfQuestions: number) => void;
}

const SurveyQuestionFilter = ({
  projectId,
  phaseId,
  shownQuestions,
  onToggleQuestion,
}: Props) => {
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

  // Add/remove from selected questions
  const toggleQuestion =
    (questionIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();

      const numberOfQuestions = results.length;
      onToggleQuestion(questionIndex, numberOfQuestions);
    };

  return (
    <Box mb="20px">
      <Text variant="bodyM" color="textSecondary">
        {formatMessage(messages.surveyChooseQuestions)}
      </Text>
      {results.map(({ question }, index) => (
        <Box key={index} mb="10px">
          <Checkbox
            checked={
              shownQuestions === undefined ? true : shownQuestions[index]
            }
            onChange={toggleQuestion(index)}
            label={localize(question)}
          />
        </Box>
      ))}
    </Box>
  );
};
export default SurveyQuestionFilter;
