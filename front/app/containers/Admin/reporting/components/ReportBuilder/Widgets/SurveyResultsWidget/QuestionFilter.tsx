import React, { ChangeEvent } from 'react';

import useFormResults from 'api/survey_results/useSurveyResults';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { Box, Checkbox, Text } from '@citizenlab/cl2-component-library';

// messages
import messages from './messages';

interface Props {
  phaseId: string;
  shownQuestions?: boolean[];
  onToggleQuestion: (questionIndex: number, numberOfQuestions: number) => void;
}

const QuestionFilter = ({
  phaseId,
  shownQuestions,
  onToggleQuestion,
}: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: formResults } = useFormResults({
    phaseId,
  });

  const fitleredResults =
    !isNilOrError(formResults) &&
    formResults.data.attributes.results.filter((result) => {
      return ![
        'multiline_text',
        'text',
        'file_upload',
        'multiselect_image',
      ].includes(result.inputType);
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
