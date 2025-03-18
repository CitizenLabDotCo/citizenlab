import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';
import useFormResults from 'api/survey_results/useSurveyResults';

import SentimentQuestion from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  projectId?: string;
  phaseId?: string;
};

const FormResults = (props: Props) => {
  const { formatMessage } = useIntl();

  // Get the projectId and phaseId from the URL
  const { projectId: projectIdParam, phaseId: phaseIdParam } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const projectId = props.projectId || projectIdParam;
  const phaseId = props.phaseId || phaseIdParam;

  const { data: project } = useProjectById(projectId);

  // Get the current year and quarter for the results
  const [search] = useSearchParams();

  // Get the year and quarter from the URL
  const year = search.get('year');
  const quarter = search.get('quarter');

  // Fetch the form results
  const { data: formResults } = useFormResults({
    phaseId,
    filterLogicIds: [],
    quarter: quarter ? parseInt(quarter, 10) : undefined,
    year: year ? parseInt(year, 10) : undefined,
  });

  if (!formResults || !project) {
    return null;
  }

  const { totalSubmissions, results } = formResults.data.attributes;

  const sentimentQuestionResults = results.filter(
    (question) => question.inputType === 'sentiment_linear_scale'
  );

  return (
    <Box width="100%">
      {totalSubmissions === 0 ? (
        <Box width="100%">
          <Text variant="bodyM" color="textSecondary">
            {formatMessage(messages.noSurveyResponses)}
          </Text>
        </Box>
      ) : (
        <Box>
          {sentimentQuestionResults.map((result, index) => {
            return <SentimentQuestion key={index} result={result} mb="8px" />;
          })}
        </Box>
      )}
    </Box>
  );
};

export default FormResults;
