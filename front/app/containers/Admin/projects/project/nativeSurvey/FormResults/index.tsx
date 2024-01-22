import React from 'react';
import { useIntl } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';

// Hooks
import useLocale from 'hooks/useLocale';

// components
import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useFormResults from 'api/survey_results/useSurveyResults';
import useProjectById from 'api/projects/useProjectById';

// Services
import FormResultsQuestion from './FormResultsQuestion';

const FormResults = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: project } = useProjectById(projectId);
  const { data: formResults } = useFormResults({
    phaseId,
  });

  if (isNilOrError(formResults) || isNilOrError(locale) || !project) {
    return null;
  }

  const { totalSubmissions, results } = formResults.data.attributes;

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses2, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses2);

  return (
    <Box width="100%">
      <Box width="100%">
        <Text variant="bodyM" color="textSecondary">
          {surveyResponseMessage}
        </Text>
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
            {formatMessage(messages.informationText2)}
          </Text>
        </Box>
      </Box>

      <Box maxWidth="524px">
        {results.map(
          (
            {
              question,
              inputType,
              answers,
              totalResponses,
              required,
              customFieldId,
            },
            index
          ) => {
            return (
              <FormResultsQuestion
                key={index}
                locale={locale}
                question={question}
                inputType={inputType}
                answers={answers}
                totalResponses={totalResponses}
                required={required}
                customFieldId={customFieldId}
              />
            );
          }
        )}
      </Box>
    </Box>
  );
};

export default FormResults;
