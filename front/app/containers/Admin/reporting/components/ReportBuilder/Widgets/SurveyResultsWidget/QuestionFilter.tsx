import React, { ChangeEvent } from 'react';

// hooks
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

const QuestionFilter = ({
  projectId,
  phaseId,
  shownQuestions,
  onToggleQuestion,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const formResults = useFormResults({
    projectId,
    phaseId,
  });

  const fitleredResults =
    !isNilOrError(formResults) &&
    formResults.results.filter((result) => {
      return (
        result.inputType !== 'text' && result.inputType !== 'multiline_text'
      );
    });
  if (!fitleredResults || fitleredResults.length === 0) {
    // This never seems to get shown
    return (
      <Text variant="bodyM" color="textSecondary">
        {formatMessage(messages.surveyNoQuestions)}
      </Text>
    );
  }

  // Add/remove from selected questions
  const toggleQuestion =
    (questionIndex: number) => (event: ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();

      const numberOfQuestions = fitleredResults.length;
      onToggleQuestion(questionIndex, numberOfQuestions);
    };

  return (
    <Box mb="20px">
      <Text variant="bodyM" color="textSecondary">
        {formatMessage(messages.surveyChooseQuestions)}
      </Text>
      {fitleredResults.map(({ question }, index) => (
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
export default QuestionFilter;
