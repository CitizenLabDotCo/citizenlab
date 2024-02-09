import React from 'react';

// hooks
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// components
import {
  Box,
  colors,
  Text,
  Title,
  Image,
} from '@citizenlab/cl2-component-library';
import CompletionBar from './CompletionBar';
import Analysis from './analysis';
import TextResponses from './TextResponses';
import Files from "./Files";

// i18n
import T from 'components/T';
import messages from '../messages';

// utils
import { snakeCase } from 'lodash-es';
import useFeatureFlag from 'hooks/useFeatureFlag';

// typings
import { Locale } from 'typings';
import { Result} from 'api/survey_results/types';

type FormResultsQuestionProps = Result & {
  locale: Locale;
  totalSubmissions: number;
};

const FormResultsQuestion = ({
  locale,
  question,
  inputType,
  answers,
  totalResponses,
  totalSubmissions,
  required,
  customFieldId,
  textResponses = [],
  files = [],
}: FormResultsQuestionProps) => {
  const isAnalysisEnabled = useFeatureFlag({ name: 'analysis' });
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const requiredOrOptionalText = required
    ? formatMessage(messages.required)
    : formatMessage(messages.optional);
  const inputTypeLabel = messages[inputType]
    ? `${totalResponses}/${totalSubmissions}
      · ${requiredOrOptionalText}
      · ${formatMessage(messages[inputType])}`
    : '';

  return (
    <Box data-cy={`e2e-${snakeCase(question[locale])}`} mb="56px">
      <Title variant="h3" mt="12px" mb="12px">
        <T value={question} />
      </Title>
      {inputTypeLabel && (
        <Text variant="bodyS" color="textSecondary" mt="12px" mb="12px">
          {inputTypeLabel}
        </Text>
      )}
      {answers &&
        answers.map(({ answer, responses, image }, index) => {
          const percentage =
            Math.round((responses / totalResponses) * 1000) / 10;

          return (
            <Box
              key={index}
              maxWidth="524px"
              display="flex"
              alignItems="flex-end"
              justifyContent="center"
            >
              {image?.small && (
                <Box mr="12px">
                  <Image
                    width="48px"
                    height="48px"
                    src={image.small}
                    alt={localize(answer)}
                  />
                </Box>
              )}
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
        })}
      {textResponses && textResponses.length > 0 && (
        <Box display="flex" gap="24px" mt={answers ? '20px' : '0'}>
          <Box flex="1">
            <TextResponses
              textResponses={textResponses}
              selectField={answers !== undefined}
            />
          </Box>
          <Box flex="1">
            {isAnalysisEnabled && <Analysis customFieldId={customFieldId} />}
          </Box>
        </Box>
      )}
      {files && files.length > 0 && (
        <Box display="flex" gap="24px" mt={answers ? '20px' : '0'}>
          <Box flex="1">
            <Files files={files} />
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default FormResultsQuestion;
