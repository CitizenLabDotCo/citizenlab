import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import useFormResults from 'api/survey_results/useSurveyResults';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import FormResultsQuestion from './FormResultsQuestion';

const FormResults = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { data: formResults } = useFormResults({
    phaseId,
  });

  if (!formResults || !project) {
    return null;
  }

  const { totalSubmissions, results } = formResults.data.attributes;

  const surveyResponseMessage =
    totalSubmissions > 0
      ? formatMessage(messages.totalSurveyResponses, {
          count: totalSubmissions,
        })
      : formatMessage(messages.noSurveyResponses);

  return (
    <Box width="100%">
      <Box width="100%">
        <Text variant="bodyM" color="textSecondary">
          {surveyResponseMessage}
        </Text>
      </Box>
      <Box>
        {totalSubmissions > 0 &&
          results.map((result, index) => {
            return (
              <FormResultsQuestion
                key={index}
                questionNumber={index + 1}
                result={result}
                totalSubmissions={totalSubmissions}
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default FormResults;
