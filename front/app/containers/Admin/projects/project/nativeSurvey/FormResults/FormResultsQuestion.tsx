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
import { Answer } from 'services/formCustomFields';

type FormResultsQuestionProps = {
  locale: Locale;
  question: Multiloc;
  inputType: string;
  answers?: Answer[];
  totalResponses: number;
  required: boolean;
};

const FormResultsQuestion = ({
  locale,
  question,
  inputType,
  answers,
  totalResponses,
  required,
}: FormResultsQuestionProps) => {
  const { formatMessage } = useIntl();

  // TODO: Replace hardcoded '2' here. Urgent to relese to fix bug though right now.
  const inputTypeText = get(messages, inputType.concat('2'), '');
  const requiredOrOptionalText = required
    ? formatMessage(messages.required2)
    : formatMessage(messages.optional2);
  const inputTypeLabel = `${formatMessage(
    inputTypeText
  )} - ${requiredOrOptionalText.toLowerCase()}`;

  return (
    <Box data-cy={`e2e-${snakeCase(question[locale])}`} mb="56px">
      <Title variant="h3" mb="0">
        <T value={question} />
      </Title>
      {inputTypeText && (
        <Text variant="bodyS" color="textSecondary" mb="0">
          {inputTypeLabel}
        </Text>
      )}
      {answers &&
        answers.map(({ answer, responses }, index) => {
          const percentage =
            Math.round((responses / totalResponses) * 1000) / 10;

          return (
            <CompletionBar
              key={index}
              bgColor={colors.primary}
              completed={percentage}
              leftLabel={answer}
              rightLabel={formatMessage(messages.choiceCount2, {
                choiceCount: responses,
                percentage,
              })}
            />
          );
        })}
    </Box>
  );
};
export default FormResultsQuestion;
