import React from 'react';

// hooks
import { useIntl } from 'utils/cl-intl';

// components
import { Box, colors, Text, Title } from '@citizenlab/cl2-component-library';
import CompletionBar from './CompletionBar';

// i18n
import T from 'components/T';
import messages from '../messages';

// utils
import { get, snakeCase } from 'lodash-es';

// typings
import { Locale, Multiloc } from 'typings';
import { Answer } from 'api/survey_results/types';
import useFeatureFlag from 'hooks/useFeatureFlag';
import Analysis from './analysis';
import TextResponses from './TextResponses';

type FormResultsQuestionProps = {
  locale: Locale;
  question: Multiloc;
  inputType: string;
  answers?: Answer[];
  totalResponses: number;
  required: boolean;
  customFieldId: string;
  textResponses?: { answer: string }[];
};

const FormResultsQuestion = ({
  locale,
  question,
  inputType,
  answers,
  totalResponses,
  required,
  customFieldId,
  textResponses = [],
}: FormResultsQuestionProps) => {
  const isAnalysisEnabled = useFeatureFlag({ name: 'analysis' });
  const { formatMessage } = useIntl();

  const inputTypeText = get(messages, inputType, '');
  const requiredOrOptionalText = required
    ? formatMessage(messages.required)
    : formatMessage(messages.optional);
  const inputTypeLabel = `${formatMessage(
    inputTypeText
  )} - ${requiredOrOptionalText.toLowerCase()}`;

  return (
    <Box data-cy={`e2e-${snakeCase(question[locale])}`} mb="56px">
      <Title variant="h3" mt="12px" mb="12px">
        <T value={question} />
      </Title>
      {inputTypeText && (
        <Text variant="bodyS" color="textSecondary" mt="12px" mb="12px">
          {inputTypeLabel}
        </Text>
      )}
      {answers && (
        answers.map(({ answer, responses }, index) => {
          const percentage =
            Math.round((responses / totalResponses) * 1000) / 10;

          return (
            <Box key={index} maxWidth="524px">
              <CompletionBar
                bgColor={colors.primary}
                completed={percentage}
                leftLabel={answer}
                rightLabel={formatMessage(messages.choiceCount, {
                  choiceCount: responses,
                  percentage,
                })}
              />
            </Box>
          );
        })
      )}
      {textResponses && textResponses.length > 0 && (
        <Box display="flex" gap="24px" mt={answers ? '20px' : '0'}>
          <Box flex="1">
            <TextResponses textResponses={textResponses} selectField={answers !== undefined} />
          </Box>
          <Box flex="1">
            {isAnalysisEnabled && <Analysis customFieldId={customFieldId} />}
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default FormResultsQuestion;
