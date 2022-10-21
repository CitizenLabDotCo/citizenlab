import { get, snakeCase } from 'lodash-es';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import { injectIntl } from 'utils/cl-intl';

// Hooks
import useLocale from 'hooks/useLocale';

// components
import {
  Box,
  colors,
  Icon,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import T from 'components/T';
import Button from 'components/UI/Button';
import CompletionBar from 'containers/Admin/formBuilder/components/FormResults/CompletionBar';

// i18n
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useFormResults from 'hooks/useFormResults';

const FormResults = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const locale = useLocale();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let phaseId = urlParams.get('phase_id');
  if (phaseId === null) {
    phaseId = '';
  }

  const formResults = useFormResults({
    projectId,
    phaseId,
  });

  if (isNilOrError(formResults) || isNilOrError(locale)) {
    return null;
  }

  const { totalSubmissions, results } = formResults;

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses);

  return (
    <Box width="100%">
      <Box width="100%" display="flex" alignItems="center">
        <Box width="100%">
          <Title variant="h2">{formatMessage(messages.surveyResults)}</Title>
          <Text variant="bodyM" color="textSecondary">
            {surveyResponseMessage}
          </Text>
        </Box>
        <Box>
          <Button
            icon="download"
            buttonStyle="secondary"
            width="auto"
            minWidth="312px"
          >
            {formatMessage(messages.downloadResults)}
          </Button>
        </Box>
      </Box>

      <Box
        bgColor={colors.teal100}
        borderRadius="3px"
        px="12px"
        py="4px"
        mt="0px"
        mb="32px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box display="flex" gap="16px" alignItems="center">
          <Icon
            name="info-outline"
            width="24px"
            height="24px"
            fill="textSecondary"
          />
          <Text variant="bodyM" color="textSecondary">
            {formatMessage(messages.informationText)}
          </Text>
        </Box>
      </Box>
      <Box maxWidth="524px">
        {results.map(
          (
            { question, inputType, answers, totalResponses, required },
            index
          ) => {
            const inputTypeText = get(messages, inputType, '');
            const requiredOrOptionalText = required
              ? formatMessage(messages.required)
              : formatMessage(messages.optional);
            const inputTypeLabel = `${formatMessage(
              inputTypeText
            )} - ${requiredOrOptionalText.toLowerCase()}`;

            return (
              <Box
                key={index}
                data-cy={`e2e-${snakeCase(question[locale])}`}
                mb="56px"
              >
                <Title variant="h3" mb="0">
                  <T value={question} />
                </Title>
                {inputTypeText && (
                  <Text variant="bodyS" color="textSecondary" mb="0">
                    {inputTypeLabel}
                  </Text>
                )}
                {answers.map(({ answer, responses }, index) => {
                  const percentage =
                    Math.round((responses / totalResponses) * 1000) / 10;

                  return (
                    <CompletionBar
                      key={index}
                      bgColor={colors.primary}
                      completed={percentage}
                      leftLabel={answer}
                      rightLabel={`${percentage}% (${responses} choices)`}
                    />
                  );
                })}
              </Box>
            );
          }
        )}
      </Box>
    </Box>
  );
};

export default injectIntl(FormResults);
