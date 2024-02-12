import React from 'react';
import { useIntl } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';

// Hooks
import useLocale from 'hooks/useLocale';
import useFormResults from 'api/survey_results/useSurveyResults';
import useProjectById from 'api/projects/useProjectById';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import FormResultsQuestion from './FormResultsQuestion';

// i18n
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

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

      <Box>
        {results.map(
          (
            {
              question,
              inputType,
              answers,
              totalResponses,
              required,
              customFieldId,
              textResponses,
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
                textResponses={textResponses}
              />
            );
          }
        )}
      </Box>
    </Box>
  );
};

export default FormResults;
